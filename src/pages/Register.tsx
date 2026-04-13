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
import { emailRegistrationSchema } from "../utils/validation";

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

const telegramSchema = z.object({
	referrer_id: z.string().optional(),
});

type TelegramFormData = z.infer<typeof telegramSchema>;

const verifyCodeSchema = z.object({
	code: z
		.string()
		.length(4, "Code must be 4 digits")
		.regex(/^\d{4}$/, "Code must be 4 digits"),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

interface EmailVerificationState {
	email: string;
	registrationToken?: string;
}

const Register = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { setAuthFromToken } = useAuth();
	const { t } = useLanguage();

	const referrerId = searchParams.get("ref") || "";

	const [registrationMethod, setRegistrationMethod] = useState<
		"email" | "telegram"
	>(
		"email"
	);
	const [step, setStep] = useState<"form" | "telegram_wait" | "verify_code">(
		"form",
	);
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showTempPassword, setShowTempPassword] = useState(false);
	const [emailExistsError, setEmailExistsError] = useState("");
	const [usernameExistsError, setUsernameExistsError] = useState("");

	const [telegramResponse, setTelegramResponse] =
		useState<RegisterStartResponse | null>(null);
	const [telegramCredentials, setTelegramCredentials] =
		useState<RegistrationStatusResponse | null>(null);
	const [pollingStatus, setPollingStatus] = useState<
		"pending" | "checking" | "completed"
	>("pending");

	const [emailVerification, setEmailVerification] =
		useState<EmailVerificationState | null>(null);
	const [emailVerificationResult, setEmailVerificationResult] =
		useState<EmailVerificationResponse | null>(null);

	const [tempCredentials, setTempCredentials] = useState<{
		username: string;
		password: string;
		connectionName?: string;
		connectionString?: string;
	} | null>(null);

	const passwordForm = useForm<z.infer<typeof emailRegistrationSchema>>({
		resolver: zodResolver(emailRegistrationSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const usernameValue = passwordForm.watch("username", "");

	const getUsernameHelperText = () => {
		const error = passwordForm.formState.errors.username;
		if (error?.message) {
			return error.message;
		}
		if (usernameValue && !/^[a-zA-Z0-9_]+$/.test(usernameValue)) {
			return t("auth.usernameInvalidFormat");
		}
		return "";
	};

	const telegramForm = useForm<TelegramFormData>({
		resolver: zodResolver(telegramSchema),
		defaultValues: {
			referrer_id: referrerId || "",
		},
	});

	const verifyCodeForm = useForm<VerifyCodeFormData>({
		resolver: zodResolver(verifyCodeSchema),
		defaultValues: {
			code: "",
		},
	});

	const passwordValue = passwordForm.watch("password", "");
	const emailValue = passwordForm.watch("email", "");

	useEffect(() => {
		setEmailExistsError("");
	}, [emailValue]);

	useEffect(() => {
		setUsernameExistsError("");
	}, [usernameValue]);

	useEffect(() => {
		const savedState = sessionStorage.getItem(SESSION_KEY);
		if (savedState) {
			try {
				const parsed = JSON.parse(savedState) as RegistrationState;
				if (parsed.method === "telegram" && parsed.registrationToken) {
					setRegistrationMethod("telegram");
					setTelegramResponse({
						telegram_link: parsed.telegramLink || "",
						registration_token: parsed.registrationToken,
						message: "",
					});
					setStep("telegram_wait");
					setPollingStatus("pending");
				} else if (
					parsed.method === "email" &&
					parsed.email &&
					parsed.username
				) {
					setRegistrationMethod("email");
					setEmailVerification({ email: parsed.email });
					setStep("verify_code");
				}
			} catch {
				sessionStorage.removeItem(SESSION_KEY);
			}
		}
	}, []);

	const clearSession = useCallback(() => {
		sessionStorage.removeItem(SESSION_KEY);
	}, []);

	const pollingStatusRef = useRef(pollingStatus);
	pollingStatusRef.current = pollingStatus;

	useEffect(() => {
		if (
			step !== "telegram_wait" ||
			!telegramResponse ||
			pollingStatusRef.current !== "pending"
		) {
			return;
		}

		setPollingStatus("checking");

		const pollInterval = setInterval(async () => {
			try {
				const status = await authService.getRegistrationStatus(
					telegramResponse.registration_token,
				);
				if (status.status === "completed") {
					setPollingStatus("completed");
					setTelegramCredentials(status);
					clearInterval(pollInterval);
				}
			} catch (err) {
				console.error("Polling error:", err);
			}
		}, 3000);

		return () => clearInterval(pollInterval);
	}, [step, telegramResponse]);

	useEffect(() => {
		if (pollingStatus === "completed" && telegramCredentials?.access_token) {
			localStorage.setItem("token", telegramCredentials.access_token);
			setAuthFromToken(telegramCredentials.access_token);
			clearSession();
			navigate("/");
		} else if (
			pollingStatus === "completed" &&
			telegramCredentials?.temp_password
		) {
			setTempCredentials({
				username: telegramCredentials.username || "",
				password: telegramCredentials.temp_password,
				connectionName: telegramCredentials.connection_name,
				connectionString: telegramCredentials.connection_string,
			});
			clearSession();
		}
	}, [
		pollingStatus,
		telegramCredentials,
		navigate,
		clearSession,
		setAuthFromToken,
	]);

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
			}
		}
	}, [emailVerificationResult, navigate, setAuthFromToken, clearSession]);

	const handleCopyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setShowTempPassword(true);
			setTimeout(() => setShowTempPassword(false), 2000);
		});
	};

	const onSubmitEmailPassword = async (
		data: z.infer<typeof emailRegistrationSchema>,
	) => {
		setError("");
		setLoading(true);
		try {
			const response = await authService.startEmailRegistration({
				username: data.username,
				email: data.email,
				referrer_id: referrerId || undefined,
			});
			setEmailVerification({ email: response.email });
			setStep("verify_code");
			sessionStorage.setItem(
				SESSION_KEY,
				JSON.stringify({
					method: "email",
					username: data.username,
					email: data.email,
				} as RegistrationState),
			);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Registration failed";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const onSubmitTelegram = async (data: TelegramFormData) => {
		setError("");
		setLoading(true);
		try {
			const effectiveReferrerId = data.referrer_id || referrerId || undefined;
			const response = await authService.registerStart({
				referrer_id: effectiveReferrerId,
			});
			setTelegramResponse(response);
			setStep("telegram_wait");
			setPollingStatus("pending");
			sessionStorage.setItem(
				SESSION_KEY,
				JSON.stringify({
					method: "telegram",
					referrer_id: effectiveReferrerId,
					registrationToken: response.registration_token,
					telegramLink: response.telegram_link,
				} as RegistrationState),
			);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Registration failed";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const onSubmitVerifyCode = async (data: VerifyCodeFormData) => {
		setError("");
		setLoading(true);
		try {
			const response = await authService.verifyEmailCode(data.code);
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

	const handleMethodChange = (newMethod: "email" | "telegram") => {
		setRegistrationMethod(newMethod);
		setError("");
	};

	const handleBack = () => {
		clearSession();
		setStep("form");
		setTelegramResponse(null);
		setTelegramCredentials(null);
		setEmailVerification(null);
		setEmailVerificationResult(null);
		setTempCredentials(null);
		setPollingStatus("pending");
		setEmailExistsError("");
		setUsernameExistsError("");
	};

	if (tempCredentials) {
		return (
			<Container component="main" maxWidth="sm">
				<Box
					sx={{
						marginTop: 8,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Paper
						sx={{
							p: 4,
							width: "100%",
							textAlign: "center",
							borderRadius: 3,
						}}
					>
						<CheckCircle sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
						<Typography component="h1" variant="h5" gutterBottom>
							{t("auth.registrationSuccess")}
						</Typography>
						<Typography variant="body2" color="textSecondary" paragraph>
							{t("auth.saveCredentials")}
						</Typography>

						<Box
							sx={{
								mt: 3,
								textAlign: "left",
								backgroundColor: "grey.50",
								p: 2,
								borderRadius: 2,
							}}
						>
							<Typography variant="subtitle2" gutterBottom>
								{t("auth.yourCredentials")}
							</Typography>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
							>
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
								<IconButton
									size="small"
									onClick={() =>
										handleCopyToClipboard(tempCredentials.password)
									}
								>
									<CopyIcon fontSize="small" />
								</IconButton>
							</Box>
						</Box>

						{tempCredentials.connectionString && (
							<Box
								sx={{
									mt: 2,
									p: 2,
									backgroundColor: "#e3f2fd",
									borderRadius: 2,
									textAlign: "left",
								}}
							>
								<Typography variant="subtitle2" gutterBottom>
									{t("dashboard.connectionString")}:{" "}
									{tempCredentials.connectionName}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Typography
										variant="body2"
										sx={{
											fontFamily: "monospace",
											fontSize: "0.75rem",
											wordBreak: "break-all",
										}}
									>
										{showTempPassword
											? tempCredentials.connectionString
											: "••••••••••••••••••••••••••"}
									</Typography>
									<IconButton
										size="small"
										onClick={() =>
											handleCopyToClipboard(
												tempCredentials.connectionString as string,
											)
										}
									>
										<CopyIcon fontSize="small" />
									</IconButton>
								</Box>
							</Box>
						)}

						<Alert severity="warning" sx={{ mt: 3, textAlign: "left" }}>
							{t("auth.saveCredentialsWarning")}
						</Alert>

						<Button
							component={RouterLink}
							to="/login"
							variant="contained"
							fullWidth
							sx={{ mt: 3, borderRadius: 2 }}
						>
							{t("auth.goToLogin")}
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	if (step === "verify_code" && emailVerification) {
		return (
			<Container component="main" maxWidth="sm">
				<Box
					sx={{
						marginTop: 8,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
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

						<Box
							component="form"
							onSubmit={verifyCodeForm.handleSubmit(onSubmitVerifyCode)}
						>
							{error && (
								<Alert severity="error" sx={{ mb: 2 }}>
									{error}
								</Alert>
							)}

							<TextField
								margin="normal"
								required
								fullWidth
								id="code"
								label={t("auth.fourDigitCode")}
								autoComplete="one-time-code"
								autoFocus
								inputProps={{
									maxLength: 4,
									inputMode: "numeric",
									pattern: "[0-9]*",
								}}
								{...verifyCodeForm.register("code")}
								error={!!verifyCodeForm.formState.errors.code}
								helperText={verifyCodeForm.formState.errors.code?.message}
								sx={{
									textAlign: "center",
									"& .MuiInputBase-input": {
										textAlign: "center",
										letterSpacing: "0.5em",
									},
								}}
							/>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{
									mt: 3,
									mb: 2,
									borderRadius: 2,
									backgroundColor: "#e65100",
								}}
								disabled={loading}
							>
								{loading ? (
									<CircularProgress size={24} />
								) : (
									t("auth.verifyCode")
								)}
							</Button>
						</Box>

						<Divider sx={{ my: 2 }} />

						<Typography variant="body2" color="textSecondary" paragraph>
							{t("auth.noEmail")}
						</Typography>

						<Button
							variant="outlined"
							fullWidth
							sx={{ borderRadius: 2 }}
							onClick={handleBack}
						>
							{t("auth.startOver")}
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	if (step === "telegram_wait" && telegramResponse) {
		return (
			<Container component="main" maxWidth="sm">
				<Box
					sx={{
						marginTop: 8,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
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
									<TelegramIcon
										sx={{ fontSize: 64, color: "#0088cc", mb: 2 }}
									/>
									<Typography component="h1" variant="h5" gutterBottom>
										{t("auth.verifyWithTelegram")}
									</Typography>
								</>
							)}
						</Box>

						<Alert
							severity={pollingStatus === "completed" ? "success" : "info"}
							sx={{ mb: 3 }}
						>
							{pollingStatus === "completed"
								? t("auth.accountVerified")
								: t("auth.openTelegramBot")}
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
							component={RouterLink}
							to="/login"
							variant="outlined"
							fullWidth
							sx={{ borderRadius: 2, mt: 2 }}
							onClick={clearSession}
						>
							{t("auth.backToLogin")}
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	return (
		<Container component="main" maxWidth="sm">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography component="h1" variant="h4" gutterBottom>
					{t("auth.createAccount")}
				</Typography>

				{referrerId && (
					<Alert severity="info" sx={{ mb: 2, width: "100%" }}>
						{t("auth.referrerId")}: {referrerId}
					</Alert>
				)}

				{registrationMethod === "email" ? (
					<Paper
						component="form"
						onSubmit={passwordForm.handleSubmit(onSubmitEmailPassword)}
						sx={{ p: 3, width: "100%", borderRadius: 3 }}
					>
						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)						}

						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label={t("auth.username")}
							autoComplete="username"
							autoFocus
							{...passwordForm.register("username")}
							error={
								!!passwordForm.formState.errors.username ||
								(usernameValue.length > 0 &&
									!/^[a-zA-Z0-9_]+$/.test(usernameValue)) ||
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
							{...passwordForm.register("email")}
							error={!!passwordForm.formState.errors.email || !!emailExistsError}
							helperText={emailExistsError ? (
								<span>
									{emailExistsError}{" "}
									<Link component={RouterLink} to="/forgot-password" style={{ textDecoration: "underline" }}>
										{t("auth.forgotPassword")}
									</Link>
								</span>
							) : passwordForm.formState.errors.email?.message || t("auth.enterCredentials")}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							id="password"
							label={t("auth.password")}
							type={showPassword ? "text" : "password"}
							autoComplete="new-password"
							{...passwordForm.register("password")}
							error={!!passwordForm.formState.errors.password}
							helperText={passwordForm.formState.errors.password?.message || t("auth.passwordHint")}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => setShowPassword(!showPassword)}
											edge="end"
										>
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
							{...passwordForm.register("confirmPassword")}
							error={!!passwordForm.formState.errors.confirmPassword}
							helperText={
								passwordForm.formState.errors.confirmPassword?.message
							}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											edge="end"
										>
											{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						<Box sx={{ mt: 2, mb: 3 }}>
							<Typography
								variant="caption"
								color="textSecondary"
								display="block"
								gutterBottom
							>
								{t("auth.passwordRequirements")}:
							</Typography>
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
								<Chip
									size="small"
									label={t("auth.min8Chars")}
									sx={{ fontSize: "0.7rem" }}
									color={passwordValue.length >= 8 ? "success" : "default"}
								/>
								<Chip
									size="small"
									label={t("auth.uppercase")}
									sx={{ fontSize: "0.7rem" }}
									color={/[A-Z]/.test(passwordValue) ? "success" : "default"}
								/>
								<Chip
									size="small"
									label={t("auth.lowercase")}
									sx={{ fontSize: "0.7rem" }}
									color={/[a-z]/.test(passwordValue) ? "success" : "default"}
								/>
								<Chip
									size="small"
									label={t("auth.number")}
									sx={{ fontSize: "0.7rem" }}
									color={/[0-9]/.test(passwordValue) ? "success" : "default"}
								/>
							</Box>
						</Box>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 1, mb: 2, borderRadius: 2, backgroundColor: "#e65100" }}
							disabled={loading}
						>
							{loading ? (
								<CircularProgress size={24} />
							) : (
								t("auth.createAccount")
							)}
						</Button>

						<Box sx={{ textAlign: "center" }}>
							<Link component={RouterLink} to="/login" variant="body2">
								{t("auth.alreadyHaveAccount")}
							</Link>
						</Box>
					</Paper>
				) : (
					<Paper
						component="form"
						onSubmit={telegramForm.handleSubmit(onSubmitTelegram)}
						sx={{ p: 3, width: "100%", borderRadius: 3 }}
					>
						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}

						<Alert severity="info" sx={{ mb: 2 }}>
							{t("auth.verifyViaTelegram")}
						</Alert>

						<TextField
							margin="normal"
							fullWidth
							id="referrer_id"
							label={t("auth.referrerIdOptional")}
							autoComplete="off"
							autoFocus
							{...telegramForm.register("referrer_id")}
							error={!!telegramForm.formState.errors.referrer_id}
							helperText={
								telegramForm.formState.errors.referrer_id?.message ||
								t("auth.enterReferrerId")
							}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2, borderRadius: 2, backgroundColor: "#0088cc" }}
							disabled={loading}
							startIcon={<TelegramIcon />}
						>
							{loading ? (
								<CircularProgress size={24} />
							) : (
								t("auth.continueWithTelegram")
							)}
						</Button>

						<Box sx={{ textAlign: "center" }}>
							<Link component={RouterLink} to="/login" variant="body2">
								{t("auth.alreadyHaveAccount")}
							</Link>
						</Box>
					</Paper>
				)}
			</Box>
		</Container>
	);
};

export default Register;
