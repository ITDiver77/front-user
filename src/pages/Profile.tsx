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
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import type { User, UserUpdateRequest } from "../types/user";
import { changePasswordSchema } from "../utils/validation";

type ProfileFormData = {
	firstName: string;
	lastName: string;
	displayName: string;
};

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const Profile = () => {
	const { user, changePassword, updateUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [profileLoading, setProfileLoading] = useState(true);
	const [profileError, setProfileError] = useState<string>("");
	const [passwordError, setPasswordError] = useState<string>("");
	const [success, setSuccess] = useState<string>("");
	const [profile, setProfile] = useState<User | null>(null);
	const [relinkDialogOpen, setRelinkDialogOpen] = useState(false);
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [rebindLink, setRebindLink] = useState<string | null>(null);
	const [rebindToken, setRebindToken] = useState<string | null>(null);
	const [rebinding, setRebinding] = useState(false);

	const {
		register: registerProfile,
		handleSubmit: handleProfileSubmit,
		formState: { errors: profileErrors },
		reset: resetProfile,
	} = useForm<ProfileFormData>({
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

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
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
		} catch (err: any) {
			setProfileError(err.message || "Failed to fetch profile");
		} finally {
			setProfileLoading(false);
		}
	};

	const handleStartRelink = async () => {
		setRebinding(true);
		try {
			const response = await userService.rebindTelegram();
			setRebindLink(response.link);
			setRebindToken(response.rebind_token);
		} catch (err: any) {
			setProfileError(err.message || "Failed to start Telegram rebind");
			setRelinkDialogOpen(false);
		} finally {
			setRebinding(false);
		}
	};

	const pollRebindStatus = useCallback(async () => {
		if (!rebindToken) return;

		try {
			const status = await authService.getRegistrationStatus(rebindToken);
			if (status.status === "completed") {
				const data = await userService.getMyProfile();
				setProfile(data);
				updateUser({ telegram_verified: data.telegram_verified });
				setRebindLink(null);
				setRebindToken(null);
				setRelinkDialogOpen(false);
			}
		} catch {
			// Continue polling
		}
	}, [rebindToken, updateUser]);

	useEffect(() => {
		if (!rebindToken) return;

		const interval = setInterval(pollRebindStatus, 3000);
		return () => clearInterval(interval);
	}, [rebindToken, pollRebindStatus]);

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
			setSuccess("Profile updated successfully");
			fetchProfile();
		} catch (err: any) {
			setProfileError(err.message || "Failed to update profile");
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
				setSuccess("Password changed successfully");
				resetPassword();
			} else {
				setPasswordError(
					"Failed to change password. Check your current password.",
				);
			}
		} catch (err: any) {
			setPasswordError(err.message || "Failed to change password");
		} finally {
			setLoading(false);
		}
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
				Profile Settings
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
							Profile Information
						</Typography>
						<Typography variant="body2" color="textSecondary" paragraph>
							Update your contact details.
						</Typography>

						{/* Telegram Verification Status */}
						{profile && (
							<Box sx={{ mb: 3 }}>
								<Typography
									variant="subtitle2"
									color="textSecondary"
									gutterBottom
								>
									Telegram Verification
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									{profile.telegram_verified ? (
										<>
											<Chip
												icon={<CheckIcon />}
												label="Verified"
												color="success"
												size="small"
											/>
											<Button
												variant="outlined"
												size="small"
												onClick={() => setRelinkDialogOpen(true)}
											>
												Relink Telegram Account
											</Button>
										</>
									) : (
										<>
											<Chip
												icon={<CloseIcon />}
												label="Not Verified"
												color="default"
												size="small"
											/>
											<Button
												variant="contained"
												size="small"
												onClick={() => setLinkDialogOpen(true)}
											>
												Link Telegram Account
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
								label="Login"
								value={user?.username || ""}
								disabled
							/>
							<TextField
								margin="normal"
								fullWidth
								label="Display Name"
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
								label="First Name"
								inputProps={{ maxLength: 100 }}
								{...registerProfile("firstName")}
								error={!!profileErrors.firstName}
								helperText={profileErrors.firstName?.message}
							/>
							<TextField
								margin="normal"
								fullWidth
								label="Last Name"
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
								{loading ? <CircularProgress size={24} /> : "Update Profile"}
							</Button>
						</form>
					</Paper>
				</Grid>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h5" gutterBottom>
							Change Password
						</Typography>
						<Typography variant="body2" color="textSecondary" paragraph>
							Enter your current password and choose a new one.
						</Typography>
						<form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
							<TextField
								margin="normal"
								fullWidth
								label="Current Password"
								type="password"
								{...registerPassword("oldPassword")}
								error={!!passwordErrors.oldPassword}
								helperText={passwordErrors.oldPassword?.message}
							/>
							<TextField
								margin="normal"
								fullWidth
								label="New Password"
								type="password"
								{...registerPassword("newPassword")}
								error={!!passwordErrors.newPassword}
								helperText={passwordErrors.newPassword?.message}
							/>
							<TextField
								margin="normal"
								fullWidth
								label="Confirm New Password"
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
								{loading ? <CircularProgress size={24} /> : "Change Password"}
							</Button>
						</form>
					</Paper>
				</Grid>
			</Grid>

			<Dialog open={relinkDialogOpen} onClose={() => setRelinkDialogOpen(false)}>
				<DialogTitle>Relink Telegram Account?</DialogTitle>
				<DialogContent>
					<Typography>
						This will generate a new verification link. Your old Telegram bot link will
						remain active until you successfully verify with the new one.
					</Typography>
					<Typography sx={{ mt: 2, color: "warning.main" }}>
						⚠️ Don't relink unless you've lost access to your old Telegram account or
						want to receive notifications on a new account.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setRelinkDialogOpen(false)}>Cancel</Button>
					<Button onClick={() => setRelinkDialogOpen(false)}>Confirm</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)}>
				<DialogTitle>Link Telegram Account</DialogTitle>
				<DialogContent>
					<Typography>
						To link your account with Telegram, please contact support. They will help you
						set up Telegram verification for your existing account.
					</Typography>
					<Typography sx={{ mt: 2 }}>
						Alternatively, you can create a new account using the Telegram bot and our
						support team can transfer your services.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setLinkDialogOpen(false)}>Close</Button>
					<Button
						onClick={() => {
							setLinkDialogOpen(false);
							window.location.href = "/support";
						}}
						variant="contained"
					>
						Contact Support
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Profile;
