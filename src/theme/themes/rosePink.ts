import { createTheme } from "@mui/material/styles";

export const rosePinkTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#E91E63",
			light: "#F48FB1",
			dark: "#C2185B",
			contrastText: "#fff",
		},
		secondary: {
			main: "#9C27B0",
			light: "#CE93D8",
			dark: "#7B1FA2",
			contrastText: "#fff",
		},
		success: { main: "#4CAF50", light: "#81C784", dark: "#388E3C" },
		warning: { main: "#FF9800", light: "#FFB74D", dark: "#F57C00" },
		error: { main: "#F44336", light: "#EF9A9A", dark: "#D32F2F" },
		background: { default: "#FFF0F5", paper: "#FFFFFF" },
		text: { primary: "#212121", secondary: "#757575" },
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#FFF0F5" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #E91E63 0%, #C2185B 100%)",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(233, 30, 99, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(233, 30, 99, 0.15)",
					background: "#FFFFFF",
				},
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#FFFFFF" } },
		},
	},
});
