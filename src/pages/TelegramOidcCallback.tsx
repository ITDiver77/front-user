import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

const TelegramOidcCallback = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setAuthFromToken } = useAuth();
	const [error, setError] = useState(false);

	useEffect(() => {
		const code = searchParams.get("code");
		const state = searchParams.get("state");

		if (!code) {
			navigate("/login", { replace: true });
			return;
		}

		const savedState = sessionStorage.getItem("tg_pkce_state");
		const codeVerifier = sessionStorage.getItem("tg_pkce_verifier");
		sessionStorage.removeItem("tg_pkce_state");
		sessionStorage.removeItem("tg_pkce_verifier");

		if (savedState && state !== savedState) {
			setError(true);
			return;
		}

		const exchange = async () => {
			try {
				const result = await authService.telegramOidcCallback(code, codeVerifier || undefined);
				if (result.login_token) {
					localStorage.setItem("vpn_login_token", result.login_token);
				}
				await setAuthFromToken(result.access_token);
				navigate("/", { replace: true });
			} catch {
				setError(true);
			}
		};

		exchange();
	}, [searchParams, navigate, setAuthFromToken]);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				gap: 2,
			}}
		>
			{error ? (
				<>
					<Typography variant="h6" color="error">
						Login failed.
					</Typography>
					<Button variant="contained" onClick={() => navigate("/login", { replace: true })}>
						Back to Login
					</Button>
				</>
			) : (
				<>
					<CircularProgress />
					<Typography variant="h6">Logging in...</Typography>
					<Button variant="text" onClick={() => navigate("/login", { replace: true })}>
						Cancel
					</Button>
				</>
			)}
		</Box>
	);
};

export default TelegramOidcCallback;
