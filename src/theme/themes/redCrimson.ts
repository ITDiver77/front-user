import { createTheme } from "@mui/material/styles";

export const redCrimsonTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#EF5350",
			light: "#E57373",
			dark: "#C62828",
			contrastText: "#fff",
		},
		secondary: {
			main: "#64B5F6",
			light: "#90CAF9",
			dark: "#1E88E5",
			contrastText: "#000",
		},
		success: { main: "#81C784", light: "#A5D6A7", dark: "#66BB6A" },
		warning: { main: "#FFB74D", light: "#FFE0B2", dark: "#FFA726" },
		error: { main: "#EF5350", light: "#EF9A9A", dark: "#C62828" },
		background: {
			default: "#1C1414",
			paper: "#2A1E1E",
		},
		text: { primary: "#FFEBEE", secondary: "#EF9A9A" },
	},
	typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#1C1414" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #EF5350 0%, #C62828 100%)",
				 "&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(239, 83, 80, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: { borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.3)", background: "#2A1E1E" },
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#2A1E1E" } },
		},
	},
});
