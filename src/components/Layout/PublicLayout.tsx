import { Login as LoginIcon, PersonAdd as RegisterIcon } from "@mui/icons-material";
import {
	AppBar,
	Box,
	Button,
	Container,
	CssBaseline,
	IconButton,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme as useMuiTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { Outlet, useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n";
import { ThemeSelector } from "../common/ThemeSelector";

const PublicLayout = () => {
	const muiTheme = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
	const navigate = useNavigate();
	const { t, language, setLanguage } = useLanguage();

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
				bgcolor: "background.default",
			}}
		>
			<CssBaseline />

			{/* Header */}
			<AppBar
				position="sticky"
				sx={{
					bgcolor: "background.paper",
					color: "text.primary",
					borderBottom: `1px solid ${muiTheme.palette.divider}`,
					boxShadow: "none",
				}}
				component={motion.header}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<Toolbar>
					<Typography
						variant={isMobile ? "subtitle1" : "h6"}
						noWrap
						component="div"
						sx={{
							flexGrow: 1,
							fontWeight: 700,
							cursor: "pointer",
							color: "primary.main",
						}}
						onClick={() => navigate("/")}
					>
						{t("app.title")}
					</Typography>

					<ThemeSelector />

					<Button
						color="inherit"
						onClick={() => setLanguage(language === "ru" ? "en" : "ru")}
						sx={{ minWidth: "auto", px: 1, fontSize: "0.8rem", fontWeight: 600 }}
					>
						{language === "ru" ? "EN" : "RU"}
					</Button>

					<Button
						variant="outlined"
						size="small"
						startIcon={!isMobile ? <LoginIcon /> : undefined}
						onClick={() => navigate("/login")}
						sx={{ ml: 1, borderRadius: 2, textTransform: "none" }}
						component={motion.button}
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
					>
						{t("instructions.nav.login")}
					</Button>

					{!isMobile && (
						<Button
							variant="contained"
							size="small"
							startIcon={<RegisterIcon />}
							onClick={() => navigate("/register")}
							sx={{ ml: 1, borderRadius: 2, textTransform: "none" }}
							component={motion.button}
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
						>
							{t("instructions.nav.register")}
						</Button>
					)}
				</Toolbar>
			</AppBar>

			{/* Main Content */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: "100%",
				}}
			>
				<Container
					maxWidth="lg"
					sx={{
						py: { xs: 3, md: 5 },
						px: { xs: 2, md: 3 },
					}}
				>
					<Outlet />
				</Container>
			</Box>

			{/* Footer */}
			<Box
				component="footer"
				sx={{
					py: 3,
					px: 3,
					textAlign: "center",
					bgcolor: "background.paper",
					color: "text.secondary",
					borderTop: `1px solid ${muiTheme.palette.divider}`,
				}}
			>
				<Typography variant="body2" color="inherit">
					{t("app.footer")}
				</Typography>
			</Box>
		</Box>
	);
};

export default PublicLayout;
