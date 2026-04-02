import { createTheme } from "@mui/material/styles";

export const sunsetTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#FF7043",
			light: "#FFAB91",
			dark: "#F4511E",
			contrastText: "#fff",
		},
		secondary: {
			main: "#FF8A65",
			light: "#FFCCBC",
			dark: "#FF5722",
			contrastText: "#fff",
		},
		success: {
			main: "#4CAF50",
			light: "#81C784",
			dark: "#388E3C",
		},
		warning: {
			main: "#FFB300",
			light: "#FFD54F",
			dark: "#FF8F00",
		},
		error: {
			main: "#E53935",
			light: "#EF5350",
			dark: "#C62828",
		},
		background: {
			default: "#FBE9E7",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#BF360C",
			secondary: "#D84315",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#FBE9E7" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #FF7043 0%, #F4511E 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(255, 112, 67, 0.4)",
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
