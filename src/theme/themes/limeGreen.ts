import { createTheme } from "@mui/material/styles";

export const limeGreenTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#7CB342",
			light: "#AED581",
			dark: "#558B2F",
			contrastText: "#fff",
		},
		secondary: {
			main: "#7B1FA2",
			light: "#BA68C8",
			dark: "#4A148C",
			contrastText: "#fff",
		},
		success: { main: "#4CAF50", light: "#81C784", dark: "#388E3C" },
		warning: { main: "#FF9800", light: "#FFB74D", dark: "#F57C00" },
		error: { main: "#F44336", light: "#EF9A9A", dark: "#D32F2F" },
		background: { default: "#F9FBE7", paper: "#FFFFFF" },
		text: { primary: "#33691E", secondary: "#689F38" },
	},
	typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#F9FBE7" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #7CB342 0%, #558B2F 100%)",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(124, 179, 66, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: { borderRadius: 16, boxShadow: "0 2px 12px rgba(124, 179, 66, 0.15)", background: "#FFFFFF" },
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#FFFFFF" } },
		},
	},
});
