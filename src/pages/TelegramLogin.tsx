import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

const TelegramLogin = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setAuthFromToken } = useAuth();
	const [error, setError] = useState(false);

	useEffect(() => {
		const idToken = searchParams.get("id_token");

		if (idToken) {
			const verify = async () => {
				try {
					const result = await authService.telegramIdTokenAuth(idToken);
					if (result.login_token) {
						localStorage.setItem("vpn_login_token", result.login_token);
					}
					await setAuthFromToken(result.access_token);
					navigate("/", { replace: true });
				} catch {
					setError(true);
				}
			};
			verify();
			return;
		}

		const id = searchParams.get("id");
		const hash = searchParams.get("hash");

		if (!id || !hash) {
			navigate("/login", { replace: true });
			return;
		}

		const verify = async () => {
			try {
				const params: Record<string, string> = {};
				const ref = searchParams.get("ref");
				for (const [key, value] of searchParams.entries()) {
					if (key !== "ref") {
						params[key] = value;
					}
				}
				if (ref) {
					params.referrer_id = ref;
				}

				const result = await authService.telegramLoginVerify(params);
				if (result.login_token) {
					localStorage.setItem("vpn_login_token", result.login_token);
				}
				await setAuthFromToken(result.access_token);
				navigate("/", { replace: true });
			} catch {
				setError(true);
			}
		};

		verify();
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

export default TelegramLogin;
