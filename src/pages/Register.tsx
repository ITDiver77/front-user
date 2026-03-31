import { zodResolver } from "@hookform/resolvers/zod";
import {
	CheckCircle,
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
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
	Link as RouterLink,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import { z } from "zod";
import { authService } from "../services/authService";
import type {
	EmailRegisterStartResponse,
	EmailVerificationResponse,
	RegisterStartResponse,
	RegistrationStatusResponse,
} from "../types/user";

// Step 1: username only (for Telegram flow)
const usernameSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must be less than 50 characters"),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

// Email registration schema (username + email)
const emailSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(50, "Username must be less than 50 characters"),
	email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

// Verification code schema (4 digits)
const verifyCodeSchema = z.object({
	code: z
		.string()
		.length(4, "Code must be 4 digits")
		.regex(/^\d{4}$/, "Code must be 4 digits"),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

// Password registration schema (without Telegram)
const passwordSchema = z
	.object({
		username: z
			.string()
			.min(3, "Username must be at least 3 characters")
			.max(50, "Username must be less than 50 characters"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(72, "Password cannot exceed 72 characters")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type PasswordFormData = z.infer<typeof passwordSchema>;

// Extended response type for site registration
interface SiteRegisterResponse {
	access_token: string;
	token_type: string;
	password: string;
	connection: {
		name: string;
		server: string;
		enabled: boolean;
	};
}

const Register = () => {
	const navigate = useNavigate();
	const [registrationMethod, setRegistrationMethod] = useState<
		"telegram" | "email" | "site"
	>("telegram");
	const [step, setStep] = useState<
		"username" | "telegram" | "email" | "verifycode"
	>("username");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [registerResponse, setRegisterResponse] =
		useState<RegisterStartResponse | null>(null);
	const [emailRegisterResponse, setEmailRegisterResponse] =
		useState<EmailRegisterStartResponse | null>(null);
	const [siteRegisterResponse, setSiteRegisterResponse] =
		useState<SiteRegisterResponse | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [pollingStatus, setPollingStatus] = useState<
		"pending" | "checking" | "completed"
	>("pending");
	const [telegramCredentials, setTelegramCredentials] =
		useState<RegistrationStatusResponse | null>(null);
	const [emailVerificationResult, setEmailVerificationResult] =
		useState<EmailVerificationResponse | null>(null);

	const {
		register: registerPasswordForm,
		handleSubmit: handlePasswordSubmit,
		formState: { errors: passwordErrors },
		watch,
	} = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			username: "",
			password: "",
			confirmPassword: "",
		},
	});

	const passwordValue = watch("password", "");

	// Polling effect for Telegram registration status
	useEffect(() => {
		if (
			step !== "telegram" ||
			!registerResponse ||
			pollingStatus !== "pending"
		) {
			return;
		}

		setPollingStatus("checking");

		const pollInterval = setInterval(async () => {
			try {
				const status = await authService.getRegistrationStatus(
					registerResponse.registration_token,
				);
				if (status.status === "completed") {
					setPollingStatus("completed");
					setTelegramCredentials(status);
					clearInterval(pollInterval);
				}
			} catch (err) {
				console.error("Polling error:", err);
			}
		}, 3000); // Poll every 3 seconds

		return () => clearInterval(pollInterval);
	}, [step, registerResponse, pollingStatus]);

	// Auto-login and redirect when Telegram verification completes
	useEffect(() => {
		if (pollingStatus === "completed" && telegramCredentials?.access_token) {
			// Store the token
			localStorage.setItem("token", telegramCredentials.access_token);
			// Redirect to dashboard
			navigate("/");
		}
	}, [pollingStatus, telegramCredentials, navigate]);

	// Check for email verification token in URL on mount
	const [searchParams] = useSearchParams();
	useEffect(() => {
		const verifyToken = searchParams.get("verify");
		if (verifyToken) {
			setLoading(true);
			authService
				.verifyEmailLink(verifyToken)
				.then((result) => {
					setEmailVerificationResult(result);
				})
				.catch((err: unknown) => {
					const errorMessage =
						err instanceof Error ? err.message : "Email verification failed";
					setError(errorMessage);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [searchParams]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UsernameFormData>({
		resolver: zodResolver(usernameSchema),
		defaultValues: {
			username: "",
		},
	});

	const {
		register: registerEmailForm,
		handleSubmit: handleEmailSubmit,
		formState: { errors: emailErrors },
	} = useForm<EmailFormData>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			username: "",
			email: "",
		},
	});

	const {
		register: registerVerifyCodeForm,
		handleSubmit: handleVerifyCodeSubmit,
		formState: { errors: verifyCodeErrors },
	} = useForm<VerifyCodeFormData>({
		resolver: zodResolver(verifyCodeSchema),
		defaultValues: {
			code: "",
		},
	});

	const onSubmitUsername = async (data: UsernameFormData) => {
		setError("");
		setLoading(true);
		try {
			const response = await authService.registerStart({
				username: data.username,
			});
			setRegisterResponse(response);
			setStep("telegram");
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to start registration";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const onSubmitPassword = async (data: PasswordFormData) => {
		setError("");
		setLoading(true);
		try {
			const registerData = {
				username: data.username,
				password: data.password,
				token: "site",
			} as unknown as Parameters<typeof authService.register>[0];
			const response = (await authService.register(
				registerData,
			)) as SiteRegisterResponse;
			setSiteRegisterResponse(response);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Registration failed. Please try again.";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const onSubmitEmail = async (data: EmailFormData) => {
		setError("");
		setLoading(true);
		try {
			const response = await authService.startEmailRegistration({
				username: data.username,
				email: data.email,
			});
			setEmailRegisterResponse(response);
			setStep("verifycode");
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to start email registration";
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
			const errorMessage =
				err instanceof Error ? err.message : "Verification failed";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleMethodChange = (
		_: React.MouseEvent<HTMLElement>,
		newMethod: "telegram" | "email" | "site" | null,
	) => {
		if (newMethod !== null) {
			setRegistrationMethod(newMethod);
			setError("");
		}
	};

	// Auto-login and redirect for site registration
	useEffect(() => {
		if (siteRegisterResponse?.access_token) {
			localStorage.setItem("token", siteRegisterResponse.access_token);
			navigate("/");
		}
	}, [siteRegisterResponse, navigate]);

	// Auto-login and redirect for email verification
	useEffect(() => {
		if (emailVerificationResult?.access_token) {
			localStorage.setItem("token", emailVerificationResult.access_token);
			navigate("/");
		}
	}, [emailVerificationResult, navigate]);

	// Success page for site registration
	if (siteRegisterResponse) {
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
							background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
							borderRadius: 3,
						}}
					>
						<CircularProgress sx={{ mb: 2 }} />
						<Typography component="h1" variant="h5" gutterBottom>
							Registering...
						</Typography>
						<Typography variant="body2" color="textSecondary">
							Setting up your account and logging you in.
						</Typography>
					</Paper>
				</Box>
			</Container>
		);
	}

	// Success page for email verification
	if (
		emailVerificationResult?.success &&
		!emailVerificationResult?.access_token
	) {
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
							background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
							borderRadius: 3,
						}}
					>
						<CheckCircle sx={{ fontSize: 48, color: "#4caf50", mb: 2 }} />
						<Typography component="h1" variant="h5" gutterBottom>
							Email Verified!
						</Typography>
						<Typography variant="body2" color="textSecondary" paragraph>
							Your email has been verified successfully.
						</Typography>
						{emailVerificationResult.temp_password && (
							<Box
								sx={{
									mt: 2,
									textAlign: "left",
									backgroundColor: "#fff",
									p: 2,
									borderRadius: 2,
								}}
							>
								<Typography variant="subtitle2" gutterBottom>
									Your temporary credentials:
								</Typography>
								<Typography variant="body2" sx={{ fontFamily: "monospace" }}>
									Username: {emailVerificationResult.username}
								</Typography>
								<Typography variant="body2" sx={{ fontFamily: "monospace" }}>
									Password: {emailVerificationResult.temp_password}
								</Typography>
							</Box>
						)}
						<Button
							component={RouterLink}
							to="/login"
							variant="contained"
							fullWidth
							sx={{ mt: 3, borderRadius: 2 }}
						>
							Go to Login
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	// Step: Email verification code entry
	if (step === "verifycode" && emailRegisterResponse) {
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
					<Typography component="h1" variant="h5" gutterBottom>
						Verify Your Email
					</Typography>

					<Alert severity="success" sx={{ mb: 3, width: "100%" }}>
						Code sent to {emailRegisterResponse.email}
					</Alert>

					<Paper sx={{ p: 3, width: "100%", borderRadius: 3 }}>
						<Box sx={{ textAlign: "center", mb: 3 }}>
							<EmailIcon sx={{ fontSize: 48, color: "#e65100", mb: 2 }} />
							<Typography variant="h6" gutterBottom>
								Enter Verification Code
							</Typography>
							<Typography variant="body2" color="textSecondary" paragraph>
								Enter the 4-digit code we sent to your email. You can also click
								the verification link in your email.
							</Typography>
						</Box>

						<Box
							component="form"
							onSubmit={handleVerifyCodeSubmit(onSubmitVerifyCode)}
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
								label="4-Digit Code"
								autoComplete="one-time-code"
								autoFocus
								inputProps={{
									maxLength: 4,
									inputMode: "numeric",
									pattern: "[0-9]*",
								}}
								{...registerVerifyCodeForm("code")}
								error={!!verifyCodeErrors.code}
								helperText={verifyCodeErrors.code?.message}
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
								{loading ? <CircularProgress size={24} /> : "Verify Code"}
							</Button>
						</Box>

						<Divider sx={{ my: 2 }} />

						<Typography variant="body2" color="textSecondary" paragraph>
							Didn't receive the email? Check your spam folder or try
							registering again with a different email.
						</Typography>

						<Button
							component={RouterLink}
							to="/register"
							variant="outlined"
							fullWidth
							sx={{ borderRadius: 2 }}
						>
							Start Over
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	// Step 2: Show Telegram link
	if (step === "telegram" && registerResponse) {
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
					<Typography component="h1" variant="h5" gutterBottom>
						Verify with Telegram
					</Typography>

					<Alert severity="info" sx={{ mb: 3, width: "100%" }}>
						{pollingStatus === "pending" || pollingStatus === "checking"
							? "Please verify your account through our Telegram bot to complete registration. This page will automatically update when verification is complete."
							: "Verification complete! Logging you in..."}
					</Alert>

					<Paper sx={{ p: 3, width: "100%", borderRadius: 3 }}>
						<Box sx={{ textAlign: "center", mb: 3 }}>
							{pollingStatus === "completed" ? (
								<CheckCircle sx={{ fontSize: 48, color: "#4caf50", mb: 2 }} />
							) : (
								<TelegramIcon sx={{ fontSize: 48, color: "#0088cc", mb: 2 }} />
							)}
							<Typography variant="h6" gutterBottom>
								{pollingStatus === "completed"
									? "Verification Complete!"
									: "Open Telegram Bot"}
							</Typography>
							<Typography variant="body2" color="textSecondary" paragraph>
								{pollingStatus === "completed"
									? "Your account has been verified. You'll be logged in automatically."
									: "Click the button below to open our Telegram bot and press /start with your registration token."}
							</Typography>
						</Box>

						{pollingStatus !== "completed" && (
							<>
								<Button
									variant="contained"
									fullWidth
									href={registerResponse.telegram_link}
									target="_blank"
									rel="noopener noreferrer"
									sx={{ mb: 2, borderRadius: 2 }}
								>
									Open Telegram Bot
								</Button>

								<Divider sx={{ my: 2 }} />

								<Typography variant="body2" color="textSecondary" gutterBottom>
									Instructions:
								</Typography>
								<ol style={{ margin: 0, paddingLeft: 20 }}>
									<li>
										<Typography variant="body2">
											Click "Open Telegram Bot" above
										</Typography>
									</li>
									<li>
										<Typography variant="body2">
											Press /start in the chat
										</Typography>
									</li>
									<li>
										<Typography variant="body2">
											Enter the registration token when prompted
										</Typography>
									</li>
									<li>
										<Typography variant="body2">
											Receive your temporary credentials from the bot
										</Typography>
									</li>
								</ol>

								<Box sx={{ mt: 3 }}>
									<Typography
										variant="caption"
										color="textSecondary"
										display="block"
										gutterBottom
									>
										Registration token (for manual entry):
									</Typography>
									<Paper
										variant="outlined"
										sx={{
											p: 1,
											backgroundColor: "grey.50",
											fontFamily: "monospace",
											fontSize: "0.75rem",
										}}
									>
										{registerResponse.registration_token}
									</Paper>
								</Box>
							</>
						)}

						<Divider sx={{ my: 2 }} />

						{pollingStatus === "checking" && (
							<Box sx={{ textAlign: "center", py: 2 }}>
								<CircularProgress size={24} sx={{ mb: 1 }} />
								<Typography variant="body2" color="textSecondary">
									Waiting for verification... Please complete the Telegram step
									above.
								</Typography>
							</Box>
						)}

						{pollingStatus === "pending" && (
							<Typography variant="body2" color="textSecondary" paragraph>
								After verification, you'll receive your login credentials via
								Telegram. You'll be automatically logged in when verification is
								complete.
							</Typography>
						)}

						<Button
							component={RouterLink}
							to="/login"
							variant="outlined"
							fullWidth
							sx={{ borderRadius: 2, mt: 2 }}
						>
							Back to Login
						</Button>
					</Paper>
				</Box>
			</Container>
		);
	}

	// Step 1: Username entry with method selection
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
				<Typography component="h1" variant="h5" gutterBottom>
					Create Account
				</Typography>

				<ToggleButtonGroup
					value={registrationMethod}
					exclusive
					onChange={handleMethodChange}
					aria-label="registration method"
					sx={{ mb: 3 }}
				>
					<ToggleButton
						value="telegram"
						sx={{
							px: 3,
							borderRadius: "20px !important",
							"&.Mui-selected": {
								backgroundColor: "#e3f2fd",
								color: "#1976d2",
								"&:hover": {
									backgroundColor: "#bbdefb",
								},
							},
						}}
					>
						<TelegramIcon sx={{ mr: 1 }} />
						Telegram
					</ToggleButton>
					<ToggleButton
						value="email"
						sx={{
							px: 3,
							borderRadius: "20px !important",
							"&.Mui-selected": {
								backgroundColor: "#fff3e0",
								color: "#e65100",
								"&:hover": {
									backgroundColor: "#ffe0b2",
								},
							},
						}}
					>
						<EmailIcon sx={{ mr: 1 }} />
						Email
					</ToggleButton>
					<ToggleButton
						value="site"
						sx={{
							px: 3,
							borderRadius: "20px !important",
							"&.Mui-selected": {
								backgroundColor: "#f3e5f5",
								color: "#7b1fa2",
								"&:hover": {
									backgroundColor: "#e1bee7",
								},
							},
						}}
					>
						Password
					</ToggleButton>
				</ToggleButtonGroup>

				{registrationMethod === "telegram" ? (
					<Box
						component="form"
						onSubmit={handleSubmit(onSubmitUsername)}
						sx={{ mt: 1, width: "100%" }}
					>
						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}

						<Alert severity="info" sx={{ mb: 2 }}>
							Registration requires a Telegram account for verification.
						</Alert>

						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label="Username"
							autoComplete="username"
							autoFocus
							{...register("username")}
							error={!!errors.username}
							helperText={errors.username?.message}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2, borderRadius: 2 }}
							disabled={loading}
						>
							{loading ? (
								<CircularProgress size={24} />
							) : (
								"Continue with Telegram"
							)}
						</Button>

						<Box sx={{ textAlign: "center" }}>
							<Link component={RouterLink} to="/login" variant="body2">
								Already have an account? Sign In
							</Link>
						</Box>
					</Box>
				) : registrationMethod === "email" ? (
					<Box
						component="form"
						onSubmit={handleEmailSubmit(onSubmitEmail)}
						sx={{ mt: 1, width: "100%" }}
					>
						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}

						<Alert severity="info" sx={{ mb: 2 }}>
							Enter your username and email to receive a verification code.
						</Alert>

						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label="Username"
							autoComplete="username"
							autoFocus
							{...registerEmailForm("username")}
							error={!!emailErrors.username}
							helperText={emailErrors.username?.message}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							autoComplete="email"
							{...registerEmailForm("email")}
							error={!!emailErrors.email}
							helperText={emailErrors.email?.message}
						/>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2, borderRadius: 2, backgroundColor: "#e65100" }}
							disabled={loading}
						>
							{loading ? (
								<CircularProgress size={24} />
							) : (
								"Send Verification Code"
							)}
						</Button>

						<Box sx={{ textAlign: "center" }}>
							<Link component={RouterLink} to="/login" variant="body2">
								Already have an account? Sign In
							</Link>
						</Box>
					</Box>
				) : (
					<Paper
						component="form"
						onSubmit={handlePasswordSubmit(onSubmitPassword)}
						sx={{
							p: 3,
							width: "100%",
							borderRadius: 3,
							backgroundColor: "#fafafa",
						}}
					>
						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}

						<Alert severity="success" sx={{ mb: 2 }}>
							Create your account with a password. No Telegram required!
						</Alert>

						<TextField
							margin="normal"
							required
							fullWidth
							id="username"
							label="Username"
							autoComplete="username"
							autoFocus
							{...registerPasswordForm("username")}
							error={!!passwordErrors.username}
							helperText={passwordErrors.username?.message}
						/>

						<TextField
							margin="normal"
							required
							fullWidth
							id="password"
							label="Password"
							type={showPassword ? "text" : "password"}
							autoComplete="new-password"
							{...registerPasswordForm("password")}
							error={!!passwordErrors.password}
							helperText={passwordErrors.password?.message}
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
							label="Confirm Password"
							type={showConfirmPassword ? "text" : "password"}
							autoComplete="new-password"
							{...registerPasswordForm("confirmPassword")}
							error={!!passwordErrors.confirmPassword}
							helperText={passwordErrors.confirmPassword?.message}
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
								Password requirements:
							</Typography>
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
								<Chip
									size="small"
									label="Min 8 characters"
									sx={{ fontSize: "0.7rem" }}
									color={passwordValue.length >= 8 ? "success" : "default"}
								/>
								<Chip
									size="small"
									label="Uppercase letter"
									sx={{ fontSize: "0.7rem" }}
									color={/[A-Z]/.test(passwordValue) ? "success" : "default"}
								/>
								<Chip
									size="small"
									label="Lowercase letter"
									sx={{ fontSize: "0.7rem" }}
									color={/[a-z]/.test(passwordValue) ? "success" : "default"}
								/>
								<Chip
									size="small"
									label="Number"
									sx={{ fontSize: "0.7rem" }}
									color={/[0-9]/.test(passwordValue) ? "success" : "default"}
								/>
							</Box>
						</Box>

						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="secondary"
							sx={{ mt: 1, mb: 2, borderRadius: 2 }}
							disabled={loading}
						>
							{loading ? <CircularProgress size={24} /> : "Create Account"}
						</Button>

						<Box sx={{ textAlign: "center" }}>
							<Link component={RouterLink} to="/login" variant="body2">
								Already have an account? Sign In
							</Link>
						</Box>
					</Paper>
				)}
			</Box>
		</Container>
	);
};

export default Register;
