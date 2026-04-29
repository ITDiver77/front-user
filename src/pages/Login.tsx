import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Container,
	FormControlLabel,
	Link,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n";
import { loginSchema } from "../utils/validation";
import { config } from "../config";

type LoginFormData = z.infer<typeof loginSchema>;

const CREDENTIALS_KEY = "vpn_saved_credentials";

const saveCredentials = (username: string, password: string) => {
	try {
		localStorage.setItem(
			CREDENTIALS_KEY,
			btoa(JSON.stringify({ username, password })),
		);
	} catch {
		/* ignore storage errors */
	}
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
	} catch {
		/* ignore */
	}
};

const TelegramLoginButton = () => {
	const [error, setError] = useState("");
	const { t } = useLanguage();

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			if (event.origin !== "https://oauth.telegram.org") return;
			let data: any;
			try {
				data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
			} catch {
				return;
			}
			if (data?.event !== "auth_result" || !data.result) return;
			const user = data.result;
			const params = new URLSearchParams();
			params.set("id", String(user.id));
			params.set("auth_date", String(user.auth_date));
			params.set("hash", user.hash);
			if (user.first_name) params.set("first_name", user.first_name);
			if (user.last_name) params.set("last_name", user.last_name);
			if (user.username) params.set("username", user.username);
			if (user.photo_url) params.set("photo_url", user.photo_url);
			window.location.href = `${window.location.origin}/auth/telegram-login?${params.toString()}`;
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, []);

	const handleClick = () => {
		setError("");
		const origin = window.location.origin;
		const redirectUri = origin + "/login";
		const authUrl =
			`https://oauth.telegram.org/auth` +
			`?response_type=post_message` +
			`&client_id=${config.TELEGRAM_BOT_ID}` +
			`&redirect_uri=${encodeURIComponent(redirectUri)}` +
			`&scope=${encodeURIComponent("openid profile telegram:bot_access")}` +
			`&origin=${encodeURIComponent(origin)}`;

		const width = 550;
		const height = 650;
		const left = Math.max(0, (screen.width - width) / 2);
		const top = Math.max(0, (screen.height - height) / 2);
		const popup = window.open(
			authUrl,
			"telegram_oauth",
			`width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no`,
		);
		if (!popup) {
			setError(t("auth.telegramUnavailable"));
		}
	};

	return (
		<Box sx={{ mt: 2, width: "100%" }}>
			<Button
				fullWidth
				variant="contained"
				onClick={handleClick}
				sx={{
					bgcolor: "#0088cc",
					color: "white",
					textTransform: "none",
					fontWeight: 600,
					"&:hover": { bgcolor: "#006699" },
				}}
				startIcon={
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
						<title>Telegram</title>
						<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
					</svg>
				}
			>
				{t("auth.loginViaTelegram")}
			</Button>
			{error && (
				<Typography variant="caption" color="error" sx={{ display: "block", textAlign: "center", mt: 0.5 }}>
					{error}
				</Typography>
			)}
		</Box>
	);
};

const Login = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
			rememberMe: true,
		},
	});

	useEffect(() => {
		const saved = loadCredentials();
		if (saved) {
			setValue("username", saved.username);
			setValue("password", saved.password);
		}
	}, [setValue]);

	const onSubmit = async (data: LoginFormData) => {
		setError("");
		setLoading(true);
		try {
			const success = await login(
				data.username,
				data.password,
				data.rememberMe,
			);
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

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography component="h1" variant="h5">
					{t("auth.signIn")}
				</Typography>
				<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}
					<TextField
						margin="normal"
						required
						fullWidth
						id="username"
						label={t("auth.username")}
						autoComplete="username"
						autoFocus
						{...register("username")}
						error={!!errors.username}
						helperText={errors.username?.message}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						label={t("auth.password")}
						type="password"
						id="password"
						autoComplete="current-password"
						{...register("password")}
						error={!!errors.password}
						helperText={errors.password?.message}
					/>
					<FormControlLabel
						control={<Checkbox color="primary" {...register("rememberMe")} />}
						label={t("auth.rememberMe")}
					/>
					<TelegramLoginButton />
				<Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 0.5, mb: 1 }}>
					{t("auth.telegramVpnRequired")}
				</Typography>
				<Button
					type="submit"
					fullWidth
					variant="contained"
					sx={{ mt: 3, mb: 2 }}
					disabled={loading}
				>
					{loading ? <CircularProgress size={24} /> : t("auth.signIn")}
				</Button>
				<Box sx={{ display: "flex", justifyContent: "space-between" }}>
						<Link component={RouterLink} to="/register" variant="body2">
							{t("auth.dontHaveAccount")}
						</Link>
						<Link component={RouterLink} to="/forgot-password" variant="body2">
							{t("auth.forgotPassword")}
						</Link>
					</Box>
				</Box>
			</Box>
		</Container>
	);
};

export default Login;
