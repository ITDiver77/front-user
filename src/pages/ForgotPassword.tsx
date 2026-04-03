import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Link,
	TextField,
	Typography,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import type { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { forgotPasswordSchema } from "../utils/validation";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const newPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(72, "Password cannot exceed 72 characters"),
		confirmPassword: z
			.string()
			.min(1, "Please confirm your password")
			.max(72, "Password cannot exceed 72 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

const ForgotPassword = () => {
	const { t } = useLanguage();
	const { forgotPassword, resetPassword } = useAuth();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [isComplete, setIsComplete] = useState(false);

	const {
		register: registerForgot,
		handleSubmit: handleForgotSubmit,
		formState: { errors: forgotErrors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { username: "" },
	});

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { errors: passwordErrors },
	} = useForm<NewPasswordFormData>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: { newPassword: "", confirmPassword: "" },
	});

	const handleForgot = async (data: ForgotPasswordFormData) => {
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			const ok = await forgotPassword(data.username);
			if (ok) {
				setSuccess(t("auth.resetLinkSent"));
			} else {
				setError(t("auth.failedToSendResetLink"));
			}
		} catch (err) {
			setError(t("auth.unexpectedError"));
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async (data: NewPasswordFormData) => {
		if (!token) {
			setError("Invalid reset link");
			return;
		}
		setError("");
		setLoading(true);
		try {
			const ok = await resetPassword(token, data.newPassword);
			if (ok) {
				setIsComplete(true);
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

	if (isComplete) {
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
					<Box sx={{ textAlign: "center", mt: 2 }}>
						<CheckCircle sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
						<Typography variant="h5" gutterBottom>
							{t("auth.passwordResetComplete")}
						</Typography>
						<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
							{t("auth.passwordResetSuccess")}
						</Typography>
						<Button
							component={RouterLink}
							to="/login"
							variant="contained"
							fullWidth
							sx={{ mt: 2, borderRadius: 2 }}
						>
							{t("auth.goToLogin")}
						</Button>
					</Box>
				</Box>
			</Container>
		);
	}

	if (token) {
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
						{t("auth.setNewPassword")}
					</Typography>
					<Box sx={{ mt: 4, width: "100%" }}>
						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}
						<Box component="form" onSubmit={handlePasswordSubmit(handleReset)}>
							<TextField
								margin="normal"
								required
								fullWidth
								label={t("auth.newPassword")}
								type="password"
								id="newPassword"
								autoFocus
								{...registerPassword("newPassword")}
								error={!!passwordErrors.newPassword}
								helperText={passwordErrors.newPassword?.message}
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								label={t("auth.confirmNewPassword")}
								type="password"
								id="confirmPassword"
								{...registerPassword("confirmPassword")}
								error={!!passwordErrors.confirmPassword}
								helperText={passwordErrors.confirmPassword?.message}
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
						<Box sx={{ textAlign: "center", mt: 2 }}>
							<Link component={RouterLink} to="/login" variant="body2">
								{t("auth.backToSignIn")}
							</Link>
						</Box>
					</Box>
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
				<Typography component="h1" variant="h5">
					{t("auth.resetPassword")}
				</Typography>
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
					<Box component="form" onSubmit={handleForgotSubmit(handleForgot)}>
						<Typography variant="body1" sx={{ mb: 2 }}>
							{t("auth.enterUsernameToReset")}
						</Typography>
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
							{loading ? <CircularProgress size={24} /> : t("auth.sendResetLink")}
						</Button>
					</Box>
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
