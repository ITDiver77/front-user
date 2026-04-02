import { createTheme } from "@mui/material/styles";

export const skyBlueTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#64B5F6",
			light: "#90CAF9",
			dark: "#42A5F5",
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
			default: "#F0F8FF",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#1E3A5F",
			secondary: "#4A6FA5",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#F0F8FF" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(100, 181, 246, 0.4)",
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