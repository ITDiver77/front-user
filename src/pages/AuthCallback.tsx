import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";

const AuthCallback = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setAuthFromToken } = useAuth();
	const [error, setError] = useState(false);

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			navigate("/login", { replace: true });
			return;
		}

		const exchangeToken = async () => {
			try {
				const response = await authService.loginByToken(token);
				await setAuthFromToken(response.access_token);
				navigate("/", { replace: true });
			} catch {
				setError(true);
				setTimeout(() => {
					navigate("/login", { replace: true });
				}, 2000);
			}
		};

		exchangeToken();
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
				<Typography variant="h6" color="error">
					Login failed. Redirecting...
				</Typography>
			) : (
				<>
					<CircularProgress />
					<Typography variant="h6">Logging in...</Typography>
				</>
			)}
		</Box>
	);
};

export default AuthCallback;
