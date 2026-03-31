import { createTheme } from "@mui/material/styles";

export const amberGoldTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#FFD54F",
			light: "#FFECB3",
			dark: "#FFB300",
			contrastText: "#000",
		},
		secondary: {
			main: "#FF8A65",
			light: "#FFCCBC",
			dark: "#FF7043",
			contrastText: "#000",
		},
		success: {
			main: "#81C784",
			light: "#A5D6A7",
			dark: "#66BB6A",
		},
		warning: {
			main: "#FFB74D",
			light: "#FFE0B2",
			dark: "#FFA726",
		},
		error: {
			main: "#EF5350",
			light: "#EF9A9A",
			dark: "#E53935",
		},
		background: {
			default: "#1C1C1C",
			paper: "#2D2D2D",
		},
		text: {
			primary: "#FFFFFF",
			secondary: "#B0B0B0",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#1C1C1C" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #FFD54F 0%, #FFB300 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(255, 213, 79, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
					background: "#2D2D2D",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: { borderRadius: 12, background: "#2D2D2D" },
			},
		},
	},
});
