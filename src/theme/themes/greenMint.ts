import { createTheme } from "@mui/material/styles";

export const greenMintTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#69F0AE",
			light: "#B9F6CA",
			dark: "#00E676",
			contrastText: "#000",
		},
		secondary: {
			main: "#CE93D8",
			light: "#E1BEE7",
			dark: "#BA68C8",
			contrastText: "#000",
		},
		success: { main: "#69F0AE", light: "#B9F6CA", dark: "#00E676" },
		warning: { main: "#FFD54F", light: "#FFECB3", dark: "#FFB300" },
		error: { main: "#FF8A80", light: "#FFCCBC", dark: "#FF5252" },
		background: {
			default: "#0D1F0D",
			paper: "#1A2E1A",
		},
		text: { primary: "#FFFFFF", secondary: "#A0D8A0" },
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#0D1F0D" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #69F0AE 0%, #00E676 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(105, 240, 174, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
					background: "#1A2E1A",
				},
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#1A2E1A" } },
		},
	},
});
