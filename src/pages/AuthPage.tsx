import { zodResolver } from "@hookform/resolvers/zod";
import {
	CheckCircle,
	ContentCopy as CopyIcon,
	Email as EmailIcon,
	Telegram as TelegramIcon,
	Visibility,
	VisibilityOff,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	Divider,
	IconButton,
	InputAdornment,
	Link,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
	Link as RouterLink,
	useLocation,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n";
import { authService } from "../services/authService";
import type {
	EmailVerificationResponse,
	RegisterStartResponse,
	RegistrationStatusResponse,
} from "../types/user";
import { emailRegistrationSchema, loginSchema } from "../utils/validation";
import { config } from "../config";

function base64url(buffer: Uint8Array): string {
	return btoa(String.fromCharCode(...buffer))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

type LoginFormData = z.infer<typeof loginSchema>;

const CREDENTIALS_KEY = "vpn_saved_credentials";

const saveCredentials = (username: string, password: string) => {
	try {
		localStorage.setItem(
			CREDENTIALS_KEY,
			btoa(JSON.stringify({ username, password })),
		);
	} catch {}
};

const loadCredentials = (): { username: string; password: string } | null => {
	try {
		const raw = localStorage.getItem(CREDENTIALS_KEY);
		if (!raw) return null;
		return JSON.parse(atob(raw));
	} catch {
		return null;
	}
};

const clearCredentials = () => {
	try {
		localStorage.removeItem(CREDENTIALS_KEY);
	} catch {}
};

const SESSION_KEY = "vpn_registration_state";

interface RegistrationState {
	method: "email" | "telegram";
	username?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
	referrer_id?: string;
	registrationToken?: string;
	telegramLink?: string;
}

const verifyCodeSchema = z.object({
	code: z
		.string()
		.length(4, "Code must be 4 digits")
		.regex(/^\d{4}$/, "Code must be 4 digits"),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

interface EmailVerificationState {
	email: string;
	password?: string;
	registrationToken?: string;
}

type AuthMode = "landing" | "login" | "register";
type LoginMethod = "methods" | "password";
type RegisterMethod = "methods" | "email_form";
type SharedSubView = null | "telegram_wait" | "verify_code" | "temp_credentials";

const TelegramIconSvg = () => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
		<title>Telegram</title>
		<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
	</svg>
);

const AuthPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { login: authLogin, setAuthFromToken } = useAuth();
	const { t } = useLanguage();

	const referrerId = searchParams.get("ref") || "";

	const [authMode, setAuthMode] = useState<AuthMode>(() => {
		if (location.pathname === "/register") return "register";
		return "landing";
	});
	const [loginMethod, setLoginMethod] = useState<LoginMethod>("methods");
	const [registerMethod, setRegisterMethod] = useState<RegisterMethod>("methods");
	const [sharedSubView, setSharedSubView] = useState<SharedSubView>(null);

	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showTempPassword, setShowTempPassword] = useState(false);
	const [authCompletedViaBot, setAuthCompletedViaBot] = useState(false);
	const [emailExistsError, setEmailExistsError] = useState("");
	const [usernameExistsError, setUsernameExistsError] = useState("");
	const [resetSent, setResetSent] = useState(false);
	const [resetSending, setResetSending] = useState(false);

	const [telegramResponse, setTelegramResponse] = useState<RegisterStartResponse | null>(null);
	const [telegramCredentials, setTelegramCredentials] = useState<RegistrationStatusResponse | null>(null);
	const [pollingStatus, setPollingStatus] = useState<"pending" | "checking" | "completed">("pending");

	const [emailVerification, setEmailVerification] = useState<EmailVerificationState | null>(null);
	const [emailVerificationResult, setEmailVerificationResult] = useState<EmailVerificationResponse | null>(null);

	const [tempCredentials, setTempCredentials] = useState<{
		username: string;
		password: string;
		connectionName?: string;
		connectionString?: string;
	} | null>(null);

	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
			rememberMe: true,
		},
	});

	const emailForm = useForm<z.infer<typeof emailRegistrationSchema>>({
		resolver: zodResolver(emailRegistrationSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const verifyCodeForm = useForm<VerifyCodeFormData>({
		resolver: zodResolver(verifyCodeSchema),
		defaultValues: {
			code: "",
		},
	});

	const usernameValue = emailForm.watch("username", "");
	const passwordValue = emailForm.watch("password", "");
	const emailValue = emailForm.watch("email", "");

	const getUsernameHelperText = () => {
		const err = emailForm.formState.errors.username;
		if (err?.message) return err.message;
		if (usernameValue && !/^[a-zA-Z0-9_]+$/.test(usernameValue)) {
			return t("auth.usernameInvalidFormat");
		}
		return "";
	};

	useEffect(() => { setEmailExistsError(""); }, [emailValue]);
	useEffect(() => { setUsernameExistsError(""); }, [usernameValue]);

	useEffect(() => {
		if (referrerId && authMode === "landing") {
			setAuthMode("register");
		}
	}, []);

	useEffect(() => {
		const saved = loadCredentials();
		if (saved) {
			loginForm.setValue("username", saved.username);
			loginForm.setValue("password", saved.password);
		}
	}, [loginForm.setValue]);

	const clearSession = useCallback(() => {
		sessionStorage.removeItem(SESSION_KEY);
	}, []);

	useEffect(() => {
		const savedState = sessionStorage.getItem(SESSION_KEY);
		if (savedState) {
			try {
				const parsed = JSON.parse(savedState) as RegistrationState;
				if (parsed.method === "telegram" && parsed.registrationToken) {
					setTelegramResponse({
						telegram_link: parsed.telegramLink || "",
						registration_token: parsed.registrationToken,
						message: "",
					});
					setSharedSubView("telegram_wait");
					setPollingStatus("pending");
				} else if (parsed.method === "email" && parsed.email && parsed.username) {
					setEmailVerification({ email: parsed.email, password: parsed.password });
					setSharedSubView("verify_code");
				}
			} catch {
				sessionStorage.removeItem(SESSION_KEY);
			}
		}
	}, []);

	const pollingStatusRef = useRef(pollingStatus);
	pollingStatusRef.current = pollingStatus;

	useEffect(() => {
		if (sharedSubView !== "telegram_wait" || !telegramResponse || pollingStatusRef.current !== "pending") {
			return;
		}
		setPollingStatus("checking");
		const pollInterval = setInterval(async () => {
			try {
				const status = await authService.getRegistrationStatus(telegramResponse.registration_token);
				if (status.status === "completed") {
					setPollingStatus("completed");
					setTelegramCredentials(status);
					clearInterval(pollInterval);
				}
			} catch (err: unknown) {
				const errorMsg = err instanceof Error ? err.message : "";
				if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
					setPollingStatus("completed");
					setAuthCompletedViaBot(true);
					clearInterval(pollInterval);
					clearSession();
				}
			}
		}, 3000);
		return () => clearInterval(pollInterval);
	}, [sharedSubView, telegramResponse]);

	useEffect(() => {
		if (pollingStatus === "completed" && telegramCredentials?.access_token) {
			localStorage.setItem("token", telegramCredentials.access_token);
			setAuthFromToken(telegramCredentials.access_token);
			clearSession();
			navigate("/");
		} else if (pollingStatus === "completed" && telegramCredentials?.temp_password) {
			setTempCredentials({
				username: telegramCredentials.username || "",
				password: telegramCredentials.temp_password,
				connectionName: telegramCredentials.connection_name,
				connectionString: telegramCredentials.connection_string,
			});
			clearSession();
			setSharedSubView("temp_credentials");
		}
	}, [pollingStatus, telegramCredentials, navigate, clearSession, setAuthFromToken]);

	useEffect(() => {
		if (emailVerificationResult?.success) {
			if (emailVerificationResult.access_token) {
				localStorage.setItem("token", emailVerificationResult.access_token);
				setAuthFromToken(emailVerificationResult.access_token).then(() => {
					clearSession();
					navigate("/");
				});
			} else if (emailVerificationResult.temp_password) {
				setTempCredentials({
					username: emailVerificationResult.username,
					password: emailVerificationResult.temp_password,
					connectionName: emailVerificationResult.connection_name,
					connectionString: emailVerificationResult.connection_string,
				});
				clearSession();
				setSharedSubView("temp_credentials");
			}
		}
	}, [emailVerificationResult, navigate, setAuthFromToken, clearSession]);

	const handleCopyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setShowTempPassword(true);
			setTimeout(() => setShowTempPassword(false), 2000);
		});
	};

	const handleTelegramOAuth = async () => {
		setError("");
		setLoading(true);
		try {
			const array = new Uint8Array(32);
			crypto.getRandomValues(array);
			const codeVerifier = base64url(array);
			const encoder = new TextEncoder();
			const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
			const codeChallenge = base64url(new Uint8Array(digest));
			const state = base64url(crypto.getRandomValues(new Uint8Array(16)));
			sessionStorage.setItem("tg_pkce_verifier", codeVerifier);
			sessionStorage.setItem("tg_pkce_state", state);
			const authUrl =
				`https://oauth.telegram.org/auth` +
				`?response_type=code` +
				`&client_id=${config.TELEGRAM_BOT_ID}` +
				`&redirect_uri=${encodeURIComponent(window.location.origin + "/auth/telegram-callback")}` +
				`&scope=${encodeURIComponent("openid profile telegram:bot_access")}` +
				`&state=${state}` +
				`&code_challenge=${codeChallenge}` +
				`&code_challenge_method=S256` +
				`&origin=${encodeURIComponent(window.location.origin)}`;
			const width = 550;
			const height = 650;
			const left = Math.max(0, (screen.width - width) / 2);
			const top = Math.max(0, (screen.height - height) / 2);
			const popup = window.open(
				authUrl,
				"telegram_oidc",
				`width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no`,
			);
			if (!popup) {
				setError(t("auth.telegramUnavailable"));
			}
		} catch {
			setError(t("auth.telegramUnavailable"));
		} finally {
			setLoading(false);
		}
	};

	const handleTelegramBot = async () => {
		setError("");
		setLoading(true);
		try {
			const response = await authService.registerStart({
				referrer_id: referrerId || undefined,
			});
			setTelegramResponse(response);
			setSharedSubView("telegram_wait");
			setPollingStatus("pending");
			sessionStorage.setItem(
				SESSION_KEY,
				JSON.stringify({
					method: "telegram",
					referrer_id: referrerId || undefined,
					registrationToken: response.registration_token,
					telegramLink: response.telegram_link,
				} as RegistrationState),
			);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : "Registration failed";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleLoginSubmit = async (data: LoginFormData) => {
		setError("");
		setLoading(true);
		try {
			const success = await authLogin(data.username, data.password, data.rememberMe);
			if (success) {
				if (data.rememberMe) {
					saveCredentials(data.username, data.password);
				} else {
					clearCredentials();
				}
				navigate("/");
			} else {
				setError(t("auth.invalidCredentials"));
			}
		} catch (err) {
			setError(t("auth.unexpectedError"));
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleEmailRegisterSubmit = async (data: z.infer<typeof emailRegistrationSchema>) => {
		setError("");
		setLoading(true);
		try {
			const response = await authService.startEmailRegistration({
				username: data.username,
				email: data.email,
				referrer_id: referrerId || undefined,
			});
			setEmailVerification({ email: response.email, password: data.password });
			setSharedSubView("verify_code");
			sessionStorage.setItem(
				SESSION_KEY,
				JSON.stringify({
					method: "email",
					username: data.username,
					email: data.email,
					password: data.password,
				} as RegistrationState),
			);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : "Registration failed";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyCodeSubmit = async (data: VerifyCodeFormData) => {
		setError("");
		setLoading(true);
		try {
			const response = await authService.verifyEmailCode(data.code, emailVerification?.password);
			setEmailVerificationResult(response);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Registration failed";
			if (message.toLowerCase().includes("email already")) {
				setEmailExistsError(t("auth.emailAlreadyRegistered"));
			} else if (message.toLowerCase().includes("username already")) {
				setUsernameExistsError(t("auth.usernameAlreadyExists"));
			} else {
				setError(message);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSendReset = async () => {
		const email = emailForm.getValues("email");
		if (!email) return;
		setResetSending(true);
		try {
			await authService.forgotPassword({ email });
			setResetSent(true);
		} catch {
			setError(t("auth.unexpectedError"));
		} finally {
			setResetSending(false);
		}
	};

	const handleResetSubView = () => {
		clearSession();
		setSharedSubView(null);
		setTelegramResponse(null);
		setTelegramCredentials(null);
		setEmailVerification(null);
		setEmailVerificationResult(null);
		setTempCredentials(null);
		setPollingStatus("pending");
		setEmailExistsError("");
		setUsernameExistsError("");
		setAuthCompletedViaBot(false);
		setError("");
	};

	const telegramButtonLabel = authMode === "register"
		? t("auth.registerViaTelegram")
		: t("auth.loginViaTelegram");
	const telegramBotLabel = authMode === "register"
		? t("auth.registerViaTelegramBot")
		: t("auth.loginViaTelegramBot");

	if (sharedSubView === "temp_credentials" && tempCredentials) {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Paper sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 3 }}>
						<CheckCircle sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
						<Typography component="h1" variant="h5" gutterBottom>
							{t("auth.registrationSuccess")}
						</Typography>
						<Typography variant="body2" color="textSecondary" paragraph>
							{t("auth.saveCredentials")}
						</Typography>
						<Box sx={{ mt: 3, textAlign: "left", backgroundColor: "grey.50", p: 2, borderRadius: 2 }}>
							<Typography variant="subtitle2" gutterBottom>
								{t("auth.yourCredentials")}
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
								<Typography variant="body2" sx={{ fontWeight: 500 }}>
									{t("auth.username")}:
								</Typography>
								<Typography variant="body2" sx={{ fontFamily: "monospace" }}>
									{tempCredentials.username}
								</Typography>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Typography variant="body2" sx={{ fontWeight: 500 }}>
									{t("auth.password")}:
								</Typography>
								<Typography variant="body2" sx={{ fontFamily: "monospace" }}>
									{showTempPassword ? tempCredentials.password : "••••••••"}
								</Typography>
								<IconButton size="small" onClick={() => handleCopyToClipboard(tempCredentials.password)}>
									<CopyIcon fontSize="small" />
								</IconButton>
							</Box>
						</Box>
						{tempCredentials.connectionString && (
							<Box sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2, textAlign: "left" }}>
								<Typography variant="subtitle2" gutterBottom>
									{t("dashboard.connectionString")}: {tempCredentials.connectionName}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem", wordBreak: "break-all" }}>
										{showTempPassword ? tempCredentials.connectionString : "••••••••••••••••••••••••••"}
									</Typography>
									<IconButton size="small" onClick={() => handleCopyToClipboard(tempCredentials.connectionString as string)}>
										<CopyIcon fontSize="small" />
									</IconButton>
								</Box>
							</Box>
						)}
						<Alert severity="warning" sx={{ mt: 3, textAlign: "left" }}>
							{t("auth.saveCredentialsWarning")}
						</Alert>
						<Button variant="contained" fullWidth sx={{ mt: 3, borderRadius: 2 }} onClick={handleResetSubView}>
							{t("auth.goToLogin")}
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	if (sharedSubView === "verify_code" && emailVerification) {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Paper sx={{ p: 4, width: "100%", borderRadius: 3 }}>
						<Box sx={{ textAlign: "center", mb: 3 }}>
							<EmailIcon sx={{ fontSize: 48, color: "#e65100", mb: 2 }} />
							<Typography component="h1" variant="h5" gutterBottom>
								{t("auth.verifyEmail")}
							</Typography>
						</Box>
						<Alert severity="success" sx={{ mb: 3 }}>
							{t("auth.verificationCodeSent")} {emailVerification.email}
						</Alert>
						<Box component="form" onSubmit={verifyCodeForm.handleSubmit(handleVerifyCodeSubmit)}>
							{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
							<TextField
								margin="normal"
								required
								fullWidth
								id="code"
								label={t("auth.fourDigitCode")}
								autoComplete="one-time-code"
								autoFocus
								inputProps={{ maxLength: 4, inputMode: "numeric", pattern: "[0-9]*" }}
								{...verifyCodeForm.register("code")}
								error={!!verifyCodeForm.formState.errors.code}
								helperText={verifyCodeForm.formState.errors.code?.message}
								sx={{
									textAlign: "center",
									"& .MuiInputBase-input": { textAlign: "center", letterSpacing: "0.5em" },
								}}
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2, borderRadius: 2, backgroundColor: "#e65100" }}
								disabled={loading}
							>
								{loading ? <CircularProgress size={24} /> : t("auth.verifyCode")}
							</Button>
						</Box>
						<Divider sx={{ my: 2 }} />
						<Typography variant="body2" color="textSecondary" paragraph>
							{t("auth.noEmail")}
						</Typography>
						<Button variant="outlined" fullWidth sx={{ borderRadius: 2 }} onClick={handleResetSubView}>
							{t("auth.startOver")}
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	if (sharedSubView === "telegram_wait" && pollingStatus === "completed" && authCompletedViaBot) {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Paper sx={{ p: 4, width: "100%", borderRadius: 3, textAlign: "center" }}>
						<CheckCircle sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
						<Typography component="h1" variant="h5" gutterBottom>
							{t("auth.authCompletedTitle")}
						</Typography>
						<Alert severity="success" sx={{ mb: 3, textAlign: "left" }}>
							{t("auth.authCompletedViaBot")}
						</Alert>
						<Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
							{t("auth.returnToPortalHint")}
						</Typography>
						<Button
							variant="contained"
							fullWidth
							sx={{ mb: 2, borderRadius: 2 }}
							onClick={() => navigate("/login")}
						>
							{t("auth.goToLogin")}
						</Button>
						<Button
							variant="outlined"
							fullWidth
							sx={{ borderRadius: 2 }}
							onClick={handleResetSubView}
						>
							{t("common.back")}
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	if (sharedSubView === "telegram_wait" && telegramResponse) {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Paper sx={{ p: 4, width: "100%", borderRadius: 3 }}>
						<Box sx={{ textAlign: "center", mb: 3 }}>
							{pollingStatus === "completed" ? (
								<>
									<CheckCircle sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
									<Typography component="h1" variant="h5" gutterBottom>
										{t("auth.verificationComplete")}
									</Typography>
								</>
							) : (
								<>
									<TelegramIcon sx={{ fontSize: 64, color: "#0088cc", mb: 2 }} />
									<Typography component="h1" variant="h5" gutterBottom>
										{t("auth.verifyWithTelegram")}
									</Typography>
								</>
							)}
						</Box>
						<Alert severity={pollingStatus === "completed" ? "success" : "info"} sx={{ mb: 3 }}>
							{pollingStatus === "completed" ? t("auth.accountVerified") : t("auth.openTelegramBot")}
						</Alert>
						{pollingStatus !== "completed" && (
							<>
								<Button
									variant="contained"
									fullWidth
									href={telegramResponse.telegram_link}
									target="_blank"
									rel="noopener noreferrer"
									sx={{ mb: 2, borderRadius: 2, py: 1.5, fontSize: "1.1rem" }}
									startIcon={<TelegramIcon />}
								>
									{t("auth.openTelegramBotButton")}
								</Button>
								{pollingStatus === "checking" && (
									<Box sx={{ textAlign: "center", py: 2 }}>
										<CircularProgress size={24} sx={{ mb: 1 }} />
										<Typography variant="body2" color="textSecondary">
											{t("auth.waitingForVerification")}
										</Typography>
									</Box>
								)}
							</>
						)}
						<Button
							variant="outlined"
							fullWidth
							sx={{ borderRadius: 2, mt: 2 }}
							onClick={handleResetSubView}
						>
							{t("auth.backToLogin")}
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	if (authMode === "landing") {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Typography component="h1" variant="h4" gutterBottom>
						{t("auth.welcomeBack")}
					</Typography>
					<Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
						{t("auth.loginOrRegister")}
					</Typography>
					{referrerId && (
						<Alert severity="info" sx={{ mb: 2, width: "100%" }}>
							{t("auth.referrerId")}: {referrerId}
						</Alert>
					)}
					<Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
						<Button
							fullWidth
							variant="contained"
							size="large"
							sx={{ py: 2, textTransform: "none", fontSize: "1.1rem", borderRadius: 2 }}
							onClick={() => { setAuthMode("login"); setLoginMethod("methods"); }}
						>
							{t("auth.signIn")}
						</Button>
						<Button
							fullWidth
							variant="outlined"
							size="large"
							sx={{ py: 2, textTransform: "none", fontSize: "1.1rem", borderRadius: 2 }}
							onClick={() => { setAuthMode("register"); setRegisterMethod("methods"); }}
						>
							{t("auth.createAccount")}
						</Button>
					</Box>
				</Box>
			</Container>
		);
	}

	if (authMode === "login" && loginMethod === "methods") {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Box sx={{ width: "100%", mb: 2 }}>
						<Button onClick={() => setAuthMode("landing")} sx={{ textTransform: "none" }}>
							← {t("common.back")}
						</Button>
					</Box>
					<Typography component="h1" variant="h5" gutterBottom>
						{t("auth.signIn")}
					</Typography>
					<Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
						{t("auth.chooseLoginMethod")}
					</Typography>
					{error && <Alert severity="error" sx={{ mb: 2, width: "100%" }}>{error}</Alert>}
					<Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
						<Button
							fullWidth
							variant="contained"
							onClick={handleTelegramOAuth}
							disabled={loading}
							sx={{
								bgcolor: "#0088cc",
								color: "white",
								textTransform: "none",
								fontWeight: 600,
								py: 1.5,
								borderRadius: 2,
								"&:hover": { bgcolor: "#006699" },
								"&:disabled": { bgcolor: "#0088cc", opacity: 0.6 },
							}}
							startIcon={<TelegramIconSvg />}
						>
							{t("auth.loginViaTelegram")}
						</Button>
						<Button
							fullWidth
							variant="contained"
							onClick={handleTelegramBot}
							disabled={loading}
							sx={{
								bgcolor: "#0088cc",
								color: "white",
								textTransform: "none",
								fontWeight: 600,
								py: 1.5,
								borderRadius: 2,
								"&:hover": { bgcolor: "#006699" },
								"&:disabled": { bgcolor: "#0088cc", opacity: 0.6 },
							}}
							startIcon={<TelegramIcon />}
						>
							{t("auth.loginViaTelegramBot")}
						</Button>
						<Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
							{t("auth.telegramVpnRequired")}
						</Typography>
						<Button
							fullWidth
							variant="outlined"
							onClick={() => setLoginMethod("password")}
							sx={{ py: 1.5, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
						>
							{t("auth.signInWithPassword")}
						</Button>
					</Box>
				</Box>
			</Container>
		);
	}

	if (authMode === "login" && loginMethod === "password") {
		return (
			<Container component="main" maxWidth="xs">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Box sx={{ width: "100%", mb: 2 }}>
						<Button onClick={() => setLoginMethod("methods")} sx={{ textTransform: "none" }}>
							← {t("common.back")}
						</Button>
					</Box>
					<Typography component="h1" variant="h5">
						{t("auth.signIn")}
					</Typography>
					<Box component="form" onSubmit={loginForm.handleSubmit(handleLoginSubmit)} sx={{ mt: 1, width: "100%" }}>
						{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label={t("auth.username")}
							autoComplete="username"
							autoFocus
							{...loginForm.register("username")}
							error={!!loginForm.formState.errors.username}
							helperText={loginForm.formState.errors.username?.message}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							label={t("auth.password")}
							type="password"
							id="password"
							autoComplete="current-password"
							{...loginForm.register("password")}
							error={!!loginForm.formState.errors.password}
							helperText={loginForm.formState.errors.password?.message}
						/>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<label>
								<input type="checkbox" {...loginForm.register("rememberMe")} style={{ marginRight: 8 }} />
								{t("auth.rememberMe")}
							</label>
							<Link component={RouterLink} to="/forgot-password" variant="body2">
								{t("auth.forgotPassword")}
							</Link>
						</Box>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}
						>
							{loading ? <CircularProgress size={24} /> : t("auth.signIn")}
						</Button>
					</Box>
				</Box>
			</Container>
		);
	}

	if (authMode === "register" && registerMethod === "methods") {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Box sx={{ width: "100%", mb: 2 }}>
						<Button onClick={() => setAuthMode("landing")} sx={{ textTransform: "none" }}>
							← {t("common.back")}
						</Button>
					</Box>
					<Typography component="h1" variant="h5" gutterBottom>
						{t("auth.createAccount")}
					</Typography>
					<Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
						{t("auth.chooseRegisterMethod")}
					</Typography>
					{referrerId && (
						<Alert severity="info" sx={{ mb: 2, width: "100%" }}>
							{t("auth.referrerId")}: {referrerId}
						</Alert>
					)}
					{error && <Alert severity="error" sx={{ mb: 2, width: "100%" }}>{error}</Alert>}
					<Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
						<Button
							fullWidth
							variant="contained"
							onClick={handleTelegramOAuth}
							disabled={loading}
							sx={{
								bgcolor: "#0088cc",
								color: "white",
								textTransform: "none",
								fontWeight: 600,
								py: 1.5,
								borderRadius: 2,
								"&:hover": { bgcolor: "#006699" },
								"&:disabled": { bgcolor: "#0088cc", opacity: 0.6 },
							}}
							startIcon={<TelegramIconSvg />}
						>
							{t("auth.registerViaTelegram")}
						</Button>
						<Button
							fullWidth
							variant="contained"
							onClick={handleTelegramBot}
							disabled={loading}
							sx={{
								bgcolor: "#0088cc",
								color: "white",
								textTransform: "none",
								fontWeight: 600,
								py: 1.5,
								borderRadius: 2,
								"&:hover": { bgcolor: "#006699" },
								"&:disabled": { bgcolor: "#0088cc", opacity: 0.6 },
							}}
							startIcon={<TelegramIcon />}
						>
							{t("auth.registerViaTelegramBot")}
						</Button>
						<Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
							{t("auth.telegramVpnRequired")}
						</Typography>
						<Button
							fullWidth
							variant="outlined"
							onClick={() => setRegisterMethod("email_form")}
							sx={{ py: 1.5, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
						>
							{t("auth.registerWithEmail")}
						</Button>
					</Box>
				</Box>
			</Container>
		);
	}

	if (authMode === "register" && registerMethod === "email_form") {
		return (
			<Container component="main" maxWidth="sm">
				<Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
					<Typography component="h1" variant="h4" gutterBottom>
						{t("auth.createAccount")}
					</Typography>
					{referrerId && (
						<Alert severity="info" sx={{ mb: 2, width: "100%" }}>
							{t("auth.referrerId")}: {referrerId}
						</Alert>
					)}
					<Paper
						component="form"
						onSubmit={emailForm.handleSubmit(handleEmailRegisterSubmit)}
						sx={{ p: 3, width: "100%", borderRadius: 3 }}
					>
						{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label={t("auth.username")}
							autoComplete="username"
							autoFocus
							{...emailForm.register("username")}
							error={
								!!emailForm.formState.errors.username ||
								(usernameValue.length > 0 && !/^[a-zA-Z0-9_]+$/.test(usernameValue)) ||
								!!usernameExistsError
							}
							helperText={usernameExistsError || getUsernameHelperText() || t("auth.usernameHint")}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label={t("auth.email")}
							autoComplete="email"
							{...emailForm.register("email")}
							error={!!emailForm.formState.errors.email || !!emailExistsError}
							helperText={emailExistsError ? (
								resetSent ? t("auth.resetLinkSent") : (
									<span>
										{emailExistsError}{" "}
										<Link
											component="button"
											type="button"
											onClick={handleSendReset}
											style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", font: "inherit" }}
											disabled={resetSending}
										>
											{resetSending ? t("common.loading") : t("auth.sendResetLink")}
										</Link>
									</span>
								)
							) : emailForm.formState.errors.email?.message || t("auth.enterCredentials")}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="password"
							label={t("auth.password")}
							type={showPassword ? "text" : "password"}
							autoComplete="new-password"
							{...emailForm.register("password")}
							error={!!emailForm.formState.errors.password}
							helperText={emailForm.formState.errors.password?.message || t("auth.passwordHint")}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
											{showPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							id="confirmPassword"
							label={t("auth.confirmPassword")}
							type={showConfirmPassword ? "text" : "password"}
							autoComplete="new-password"
							{...emailForm.register("confirmPassword")}
							error={!!emailForm.formState.errors.confirmPassword}
							helperText={emailForm.formState.errors.confirmPassword?.message}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
											{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
						<Box sx={{ mt: 2, mb: 3 }}>
							<Typography variant="caption" color="textSecondary" display="block" gutterBottom>
								{t("auth.passwordRequirements")}:
							</Typography>
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
								<Chip size="small" label={t("auth.min8Chars")} sx={{ fontSize: "0.7rem" }} color={passwordValue.length >= 8 ? "success" : "default"} />
								<Chip size="small" label={t("auth.uppercase")} sx={{ fontSize: "0.7rem" }} color={/[A-Z]/.test(passwordValue) ? "success" : "default"} />
								<Chip size="small" label={t("auth.lowercase")} sx={{ fontSize: "0.7rem" }} color={/[a-z]/.test(passwordValue) ? "success" : "default"} />
								<Chip size="small" label={t("auth.number")} sx={{ fontSize: "0.7rem" }} color={/[0-9]/.test(passwordValue) ? "success" : "default"} />
							</Box>
						</Box>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 1, mb: 2, borderRadius: 2, backgroundColor: "#e65100" }}
							disabled={loading}
						>
							{loading ? <CircularProgress size={24} /> : t("auth.createAccount")}
						</Button>
						<Box sx={{ textAlign: "center" }}>
							<Link
								component="button"
								variant="body2"
								onClick={() => { setAuthMode("register"); setRegisterMethod("methods"); }}
								style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
							>
								{t("common.back")}
							</Link>
						</Box>
					</Paper>
				</Box>
			</Container>
		);
	}

	return null;
};

export default AuthPage;
