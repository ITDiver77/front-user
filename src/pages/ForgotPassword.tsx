import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Link,
	Step,
	StepLabel,
	Stepper,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { forgotPasswordSchema, resetPasswordSchema } from "../utils/validation";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ForgotPassword = () => {
	const { t } = useLanguage();
	const { forgotPassword, resetPassword } = useAuth();
	const navigate = useNavigate();
	const [activeStep, setActiveStep] = useState(0);
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const {
		register: registerForgot,
		handleSubmit: handleForgotSubmit,
		formState: { errors: forgotErrors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { username: "" },
	});

	const {
		register: registerReset,
		handleSubmit: handleResetSubmit,
		formState: { errors: resetErrors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { token: "", newPassword: "", confirmPassword: "" },
	});

	const handleForgot = async (data: ForgotPasswordFormData) => {
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			const ok = await forgotPassword(data.username);
			if (ok) {
				setUsername(data.username);
				setSuccess(t("auth.resetTokenSent"));
				setActiveStep(1);
			} else {
				setError(t("auth.failedToSendResetToken"));
			}
		} catch (err) {
			setError(t("auth.unexpectedError"));
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async (data: ResetPasswordFormData) => {
		setError("");
		setLoading(true);
		try {
			const ok = await resetPassword(data.token, data.newPassword);
			if (ok) {
				setSuccess(t("auth.passwordResetSuccess"));
				setTimeout(() => navigate("/login"), 3000);
			} else {
				setError(t("auth.invalidTokenOrResetFailed"));
			}
		} catch (err) {
			setError(t("auth.unexpectedError"));
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

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
				<Typography component="h1" variant="h5">
					{t("auth.resetPassword")}
				</Typography>
				<Stepper activeStep={activeStep} sx={{ width: "100%", mt: 4 }}>
					<Step>
						<StepLabel>{t("auth.enterUsername")}</StepLabel>
					</Step>
					<Step>
						<StepLabel>{t("auth.resetPasswordStep")}</StepLabel>
					</Step>
				</Stepper>
				<Box sx={{ mt: 4, width: "100%" }}>
					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}
					{success && (
						<Alert severity="success" sx={{ mb: 2 }}>
							{success}
						</Alert>
					)}
					{activeStep === 0 ? (
						<Box component="form" onSubmit={handleForgotSubmit(handleForgot)}>
							<TextField
								margin="normal"
								required
								fullWidth
								id="username"
								label={t("auth.username")}
								autoComplete="username"
								autoFocus
								{...registerForgot("username")}
								error={!!forgotErrors.username}
								helperText={forgotErrors.username?.message}
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
								disabled={loading}
							>
								{loading ? <CircularProgress size={24} /> : t("auth.sendResetToken")}
							</Button>
						</Box>
					) : (
						<Box component="form" onSubmit={handleResetSubmit(handleReset)}>
							<TextField
								margin="normal"
								required
								fullWidth
								id="token"
								label={t("auth.resetToken")}
								autoFocus
								{...registerReset("token")}
								error={!!resetErrors.token}
								helperText={resetErrors.token?.message}
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								label={t("auth.newPassword")}
								type="password"
								id="newPassword"
								{...registerReset("newPassword")}
								error={!!resetErrors.newPassword}
								helperText={resetErrors.newPassword?.message}
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								label={t("auth.confirmNewPassword")}
								type="password"
								id="confirmPassword"
								{...registerReset("confirmPassword")}
								error={!!resetErrors.confirmPassword}
								helperText={resetErrors.confirmPassword?.message}
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
								disabled={loading}
							>
								{loading ? <CircularProgress size={24} /> : t("auth.resetPasswordButton")}
							</Button>
						</Box>
					)}
					<Box sx={{ textAlign: "center", mt: 2 }}>
						<Link component={RouterLink} to="/login" variant="body2">
							{t("auth.backToSignIn")}
						</Link>
					</Box>
				</Box>
			</Box>
		</Container>
	);
};

export default ForgotPassword;
