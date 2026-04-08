import { zodResolver } from "@hookform/resolvers/zod";
import { Check as CheckIcon, Close as CloseIcon } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n";
import { ApiError } from "../services/api";
import { userService } from "../services/userService";
import type { User, UserUpdateRequest } from "../types/user";
import {
	changePasswordSchema,
	emailSchema,
	profileSchema,
} from "../utils/validation";

type ProfileFormData = z.infer<typeof profileSchema>;

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const Profile = () => {
	const { user, changePassword, updateUser } = useAuth();
	const { t } = useLanguage();
	const [loading, setLoading] = useState(false);
	const [profileLoading, setProfileLoading] = useState(true);
	const [profileError, setProfileError] = useState<string>("");
	const [passwordError, setPasswordError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const [profile, setProfile] = useState<User | null>(null);
	const [relinkDialogOpen, setRelinkDialogOpen] = useState(false);
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [rebindLink, setRebindLink] = useState<string | null>(null);
	const [rebinding, setRebinding] = useState(false);
	const [emailDialogOpen, setEmailDialogOpen] = useState(false);
	const [emailStep, setEmailStep] = useState<"input" | "verify">("input");
	const [newEmail, setNewEmail] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [emailError, setEmailError] = useState("");
	const [emailLoading, setEmailLoading] = useState(false);
	const [maskedPendingEmail, setMaskedPendingEmail] = useState<string | null>(
		null,
	);

	const {
		register: registerProfile,
		handleSubmit: handleProfileSubmit,
		formState: { errors: profileErrors },
		reset: resetProfile,
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			displayName: "",
		},
	});

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { errors: passwordErrors },
		reset: resetPassword,
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const fetchProfile = useCallback(async () => {
		setProfileLoading(true);
		try {
			const data = await userService.getMyProfile();
			setProfile(data);
			updateUser({ telegram_verified: data.telegram_verified });
			resetProfile({
				firstName: data.first_name || "",
				lastName: data.last_name || "",
				displayName: data.display_name || "",
			});
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setProfileError(err.message);
			} else {
				setProfileError(t("profile.failedToFetchProfile"));
			}
		} finally {
			setProfileLoading(false);
		}
	}, [updateUser, resetProfile, t]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	const handleStartRelink = async () => {
		setRebinding(true);
		try {
			const response = await userService.rebindTelegram();
			setRebindLink(response.link);
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setProfileError(err.message);
			} else {
				setProfileError(t("common.error"));
			}
			setRelinkDialogOpen(false);
		} finally {
			setRebinding(false);
		}
	};

	const onProfileSubmit = async (data: ProfileFormData) => {
		setLoading(true);
		setProfileError("");
		setSuccess("");
		try {
			const updateData: UserUpdateRequest = {
				first_name: data.firstName || null,
				last_name: data.lastName || null,
				display_name: data.displayName || null,
			};
			await userService.updateProfile(updateData);
			setSuccess(t("profile.profileUpdatedSuccess"));
			fetchProfile();
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setProfileError(err.message);
			} else {
				setProfileError(t("common.error"));
			}
		} finally {
			setLoading(false);
		}
	};

	const onPasswordSubmit = async (data: ChangePasswordFormData) => {
		setLoading(true);
		setPasswordError("");
		setSuccess("");
		try {
			const ok = await changePassword(data.oldPassword, data.newPassword);
			if (ok) {
				setSuccess(t("profile.passwordUpdatedSuccess"));
				resetPassword();
			} else {
				setPasswordError(t("profile.failedToChangePassword"));
			}
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setPasswordError(err.message);
			} else {
				setPasswordError(t("common.error"));
			}
		} finally {
			setLoading(false);
		}
	};

	const handleStartEmailChange = async () => {
		const result = emailSchema.safeParse({ email: newEmail });
		if (!result.success) {
			setEmailError(result.error.errors[0].message);
			return;
		}
		setEmailLoading(true);
		setEmailError("");
		try {
			const response = await userService.startEmailChange(newEmail);
			setMaskedPendingEmail(response.new_email);
			setEmailStep("verify");
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setEmailError(err.message);
			} else {
				setEmailError(t("common.error"));
			}
		} finally {
			setEmailLoading(false);
		}
	};

	const handleVerifyEmailChange = async () => {
		setEmailLoading(true);
		setEmailError("");
		try {
			await userService.verifyEmailChange(verificationCode);
			setSuccess(t("profile.emailChangeSuccess"));
			setEmailDialogOpen(false);
			setEmailStep("input");
			setNewEmail("");
			setVerificationCode("");
			setMaskedPendingEmail(null);
			fetchProfile();
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setEmailError(err.message);
			} else {
				setEmailError(t("common.error"));
			}
		} finally {
			setEmailLoading(false);
		}
	};

	const handleCancelEmailChange = async () => {
		try {
			await userService.cancelEmailChange();
		} catch {}
		setEmailDialogOpen(false);
		setEmailStep("input");
		setNewEmail("");
		setVerificationCode("");
		setMaskedPendingEmail(null);
		setEmailError("");
	};

	const openEmailDialog = () => {
		setEmailDialogOpen(true);
		setEmailStep("input");
		setNewEmail("");
		setVerificationCode("");
		setMaskedPendingEmail(null);
		setEmailError("");
	};

	if (profileLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="60vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Typography variant="h4" sx={{ mb: 3 }}>
				{t("profile.title")}
			</Typography>
			{profileError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{profileError}
				</Alert>
			)}
			{passwordError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{passwordError}
				</Alert>
			)}
			{success && (
				<Alert severity="success" sx={{ mb: 2 }}>
					{success}
				</Alert>
			)}
			<Grid container spacing={4}>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h5" gutterBottom>
							{t("profile.personalInfo")}
						</Typography>
						<Typography variant="body2" color="textSecondary" paragraph>
							{t("profile.updateContactDetails")}
						</Typography>

						{/* Telegram Verification Status */}
						{profile && (
							<Box sx={{ mb: 3 }}>
								<Typography
									variant="subtitle2"
									color="textSecondary"
									gutterBottom
								>
									{t("profile.telegramVerification")}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									{profile.telegram_verified ? (
										<>
											<Chip
												icon={<CheckIcon />}
												label={t("profile.verified")}
												color="success"
												size="small"
											/>
											<Button
												variant="outlined"
												size="small"
												onClick={() => setRelinkDialogOpen(true)}
											>
												{t("profile.relinkTelegram")}
											</Button>
										</>
									) : (
										<>
											<Chip
												icon={<CloseIcon />}
												label={t("profile.notVerified")}
												color="default"
												size="small"
											/>
											<Button
												variant="contained"
												size="small"
												onClick={() => setLinkDialogOpen(true)}
											>
												{t("profile.linkTelegram")}
											</Button>
										</>
									)}
								</Box>
							</Box>
						)}

						{/* Email Verification Status */}
						{profile && (
							<Box sx={{ mb: 3 }}>
								<Typography
									variant="subtitle2"
									color="textSecondary"
									gutterBottom
								>
									{t("profile.emailVerification")}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									{profile.email_verified && profile.email ? (
										<>
											<Chip
												icon={<CheckIcon />}
												label={profile.email}
												color="success"
												size="small"
											/>
											<Button
												variant="outlined"
												size="small"
												onClick={openEmailDialog}
											>
												{t("profile.changeEmail")}
											</Button>
										</>
									) : profile.email ? (
										<>
											<Chip
												icon={<CloseIcon />}
												label={profile.email}
												color="default"
												size="small"
											/>
											<Button
												variant="outlined"
												size="small"
												onClick={openEmailDialog}
											>
												{t("profile.verifyEmail")}
											</Button>
										</>
									) : (
										<>
											<Chip
												icon={<CloseIcon />}
												label={t("profile.emailNotSet")}
												color="default"
												size="small"
											/>
											<Button
												variant="contained"
												size="small"
												onClick={openEmailDialog}
											>
												{t("profile.addEmail")}
											</Button>
										</>
									)}
								</Box>
							</Box>
						)}

						<form onSubmit={handleProfileSubmit(onProfileSubmit)}>
							<TextField
								margin="normal"
								fullWidth
								label={t("auth.username")}
								value={user?.username || ""}
								disabled
							/>
							<TextField
								margin="normal"
								fullWidth
								label={t("profile.displayName")}
								inputProps={{ maxLength: 50 }}
								{...registerProfile("displayName")}
								error={!!profileErrors.displayName}
								helperText={
									profileErrors.displayName?.message ||
									`${profile.display_name?.length || 0}/50 characters`
								}
							/>
							<TextField
								margin="normal"
								fullWidth
								label={t("profile.firstName")}
								inputProps={{ maxLength: 100 }}
								{...registerProfile("firstName")}
								error={!!profileErrors.firstName}
								helperText={profileErrors.firstName?.message}
							/>
							<TextField
								margin="normal"
								fullWidth
								label={t("profile.lastName")}
								inputProps={{ maxLength: 100 }}
								{...registerProfile("lastName")}
								error={!!profileErrors.lastName}
								helperText={profileErrors.lastName?.message}
							/>
							<Button
								type="submit"
								variant="contained"
								sx={{ mt: 2 }}
								disabled={loading}
							>
								{loading ? (
									<CircularProgress size={24} />
								) : (
									t("profile.updateProfile")
								)}
							</Button>
						</form>
					</Paper>
				</Grid>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h5" gutterBottom>
							{t("profile.changePassword")}
						</Typography>
						<Typography variant="body2" color="textSecondary" paragraph>
							{t("profile.enterCurrentPassword")}
						</Typography>
						<form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
							<TextField
								margin="normal"
								fullWidth
								label={t("profile.currentPassword")}
								type="password"
								{...registerPassword("oldPassword")}
								error={!!passwordErrors.oldPassword}
								helperText={passwordErrors.oldPassword?.message}
							/>
							<TextField
								margin="normal"
								fullWidth
								label={t("profile.newPassword")}
								type="password"
								{...registerPassword("newPassword")}
								error={!!passwordErrors.newPassword}
								helperText={passwordErrors.newPassword?.message}
							/>
							<TextField
								margin="normal"
								fullWidth
								label={t("profile.confirmNewPassword")}
								type="password"
								{...registerPassword("confirmPassword")}
								error={!!passwordErrors.confirmPassword}
								helperText={passwordErrors.confirmPassword?.message}
							/>
							<Button
								type="submit"
								variant="contained"
								sx={{ mt: 2 }}
								disabled={loading}
							>
								{loading ? (
									<CircularProgress size={24} />
								) : (
									t("profile.changePassword")
								)}
							</Button>
						</form>
					</Paper>
				</Grid>
			</Grid>

			<Dialog
				open={relinkDialogOpen}
				onClose={() => setRelinkDialogOpen(false)}
			>
				<DialogTitle>{t("profile.relinkTelegramTitle")}</DialogTitle>
				<DialogContent>
					{rebinding ? (
						<Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
							<CircularProgress size={24} />
							<Typography>{t("profile.generatingRebind")}</Typography>
						</Box>
					) : rebindLink ? (
						<>
							<Typography sx={{ mb: 2 }}>
								{t("profile.clickToVerify")}
							</Typography>
							<Button
								variant="contained"
								href={rebindLink}
								target="_blank"
								rel="noopener noreferrer"
								fullWidth
							>
								{t("profile.openTelegramBot")}
							</Button>
							<Typography
								sx={{ mt: 2, fontSize: "0.875rem", color: "text.secondary" }}
							>
								{t("profile.completeVerification")}
							</Typography>
						</>
					) : (
						<>
							<Typography>{t("profile.newVerificationLink")}</Typography>
							<Typography sx={{ mt: 2, color: "warning.main" }}>
								⚠️ {t("profile.dontRelinkWarning")}
							</Typography>
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setRelinkDialogOpen(false);
							setRebindLink(null);
						}}
					>
						{rebindLink ? t("common.close") : t("common.cancel")}
					</Button>
					{!rebindLink && !rebinding && (
						<Button onClick={handleStartRelink} variant="contained">
							{t("common.confirm")}
						</Button>
					)}
				</DialogActions>
			</Dialog>

			<Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
				<DialogTitle>{t("profile.linkTelegramTitle")}</DialogTitle>
				<DialogContent>
					<Typography>{t("profile.linkTelegramDesc")}</Typography>
					<Typography sx={{ mt: 2 }}>{t("profile.linkTelegramAlt")}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setLinkDialogOpen(false)}>
						{t("common.close")}
					</Button>
					<Button
						onClick={() => {
							setLinkDialogOpen(false);
							window.location.href = "/support";
						}}
						variant="contained"
					>
						{t("profile.contactSupport")}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={emailDialogOpen} onClose={handleCancelEmailChange}>
				<DialogTitle>{t("profile.emailVerificationTitle")}</DialogTitle>
				<DialogContent>
					{emailStep === "input" ? (
						<>
							<Typography variant="body2" sx={{ mb: 2 }}>
								{t("profile.emailVerificationDesc")}
							</Typography>
							<TextField
								fullWidth
								label={t("profile.newEmail")}
								type="email"
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								error={!!emailError}
								helperText={emailError}
							/>
						</>
					) : (
						<>
							<Typography variant="body2" sx={{ mb: 2 }}>
								{t("profile.verificationCodeSent")} {maskedPendingEmail}
							</Typography>
							<TextField
								fullWidth
								label={t("profile.verificationCode")}
								value={verificationCode}
								onChange={(e) =>
									setVerificationCode(
										e.target.value.replace(/\D/g, "").slice(0, 4),
									)
								}
								error={!!emailError}
								helperText={emailError}
								inputProps={{ maxLength: 4 }}
								placeholder="0000"
							/>
						</>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCancelEmailChange}>
						{t("profile.cancelEmailChange")}
					</Button>
					{emailStep === "input" ? (
						<Button
							onClick={handleStartEmailChange}
							variant="contained"
							disabled={emailLoading || !newEmail}
						>
							{emailLoading ? (
								<CircularProgress size={24} />
							) : (
								t("profile.sendVerificationCode")
							)}
						</Button>
					) : (
						<Button
							onClick={handleVerifyEmailChange}
							variant="contained"
							disabled={emailLoading || verificationCode.length !== 4}
						>
							{emailLoading ? (
								<CircularProgress size={24} />
							) : (
								t("profile.verifyAndUpdate")
							)}
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Profile;
