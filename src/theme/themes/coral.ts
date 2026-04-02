import { createTheme } from "@mui/material/styles";

export const coralTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#FF7F7F",
			light: "#FFB3B3",
			dark: "#E64A4A",
			contrastText: "#fff",
		},
		secondary: {
			main: "#FFB74D",
			light: "#FFD180",
			dark: "#FF9800",
			contrastText: "#fff",
		},
		success: {
			main: "#66BB6A",
			light: "#81C784",
			dark: "#43A047",
		},
		warning: {
			main: "#FFA726",
			light: "#FFCC80",
			dark: "#FB8C00",
		},
		error: {
			main: "#EF5350",
			light: "#EF9A9A",
			dark: "#E53935",
		},
		background: {
			default: "#FFF5F5",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#4A1010",
			secondary: "#7B3E3E",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#FFF5F5" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #FF7F7F 0%, #E64A4A 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(255, 127, 127, 0.4)",
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