import { createTheme } from "@mui/material/styles";

export const honeyTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#FFB300",
			light: "#FFD54F",
			dark: "#FF8F00",
			contrastText: "#000",
		},
		secondary: {
			main: "#8D6E63",
			light: "#BCAAA4",
			dark: "#6D4C41",
			contrastText: "#fff",
		},
		success: {
			main: "#4CAF50",
			light: "#81C784",
			dark: "#388E3C",
		},
		warning: {
			main: "#FF9800",
			light: "#FFB74D",
			dark: "#F57C00",
		},
		error: {
			main: "#F44336",
			light: "#EF5350",
			dark: "#E53935",
		},
		background: {
			default: "#FFF8E1",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#3E2723",
			secondary: "#5D4037",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#FFF8E1" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(255, 179, 0, 0.4)",
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
