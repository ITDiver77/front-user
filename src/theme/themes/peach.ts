import { createTheme } from "@mui/material/styles";

export const peachTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#FFAB91",
			light: "#FFCCBC",
			dark: "#FF8A65",
			contrastText: "#fff",
		},
		secondary: {
			main: "#CE93D8",
			light: "#E1BEE7",
			dark: "#BA68C8",
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
			default: "#FFF8F5",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#4A2C2A",
			secondary: "#7B4E4A",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#FFF8F5" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #FFAB91 0%, #FF8A65 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(255, 171, 145, 0.4)",
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