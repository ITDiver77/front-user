import { createTheme } from "@mui/material/styles";

export const sageTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#9CAF88",
			light: "#C5E1A5",
			dark: "#7CB342",
			contrastText: "#fff",
		},
		secondary: {
			main: "#BCAAA4",
			light: "#D7CCC8",
			dark: "#A1887F",
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
			default: "#F5F8F5",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#2E3D2E",
			secondary: "#5D6E5D",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#F5F8F5" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #9CAF88 0%, #7CB342 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(156, 175, 136, 0.4)",
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
