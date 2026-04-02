import { createTheme } from "@mui/material/styles";

export const matchaTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#7CB342",
			light: "#AED581",
			dark: "#558B2F",
			contrastText: "#fff",
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
			main: "#FFA000",
			light: "#FFCA28",
			dark: "#FF8F00",
		},
		error: {
			main: "#D32F2F",
			light: "#EF5350",
			dark: "#C62828",
		},
		background: {
			default: "#F1F8E9",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#33691E",
			secondary: "#558B2F",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#F1F8E9" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #7CB342 0%, #558B2F 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(124, 179, 66, 0.4)",
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
