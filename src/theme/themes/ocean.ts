import { createTheme } from "@mui/material/styles";

export const oceanTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#00ACC1",
			light: "#4DD0E1",
			dark: "#00838F",
			contrastText: "#fff",
		},
		secondary: {
			main: "#5C6BC0",
			light: "#7986CB",
			dark: "#3949AB",
			contrastText: "#fff",
		},
		success: {
			main: "#43A047",
			light: "#66BB6A",
			dark: "#2E7D32",
		},
		warning: {
			main: "#FB8C00",
			light: "#FFB74D",
			dark: "#F57C00",
		},
		error: {
			main: "#E53935",
			light: "#EF5350",
			dark: "#C62828",
		},
		background: {
			default: "#E0F7FA",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#006064",
			secondary: "#00838F",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#E0F7FA" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #00ACC1 0%, #00838F 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(0, 172, 193, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
					background: "#FFFFFF",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: { borderRadius: 12, background: "#FFFFFF" },
			},
		},
	},
});
