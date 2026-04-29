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
import { useEffect, useRef, useState } from "react";
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
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const script = document.createElement("script");
		script.async = true;
		script.src = "https://oauth.telegram.org/js/telegram-login.js?3";
		script.setAttribute("data-client-id", config.TELEGRAM_BOT_ID);
		script.setAttribute("data-size", "large");
		script.setAttribute("data-auth-url", `${window.location.origin}/auth/telegram-login`);
		script.setAttribute("data-request-access", "write");

		const wrapper = document.createElement("div");
		wrapper.style.display = "flex";
		wrapper.style.justifyContent = "center";
		wrapper.appendChild(script);

		containerRef.current.innerHTML = "";
		containerRef.current.appendChild(wrapper);
	}, []);

	return <div ref={containerRef} />;
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
