import { createTheme } from "@mui/material/styles";

export const cyanBlueTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#18FFFF",
			light: "#88FFFF",
			dark: "#00E5FF",
			contrastText: "#000",
		},
		secondary: {
			main: "#FF8A65",
			light: "#FFCCBC",
			dark: "#FF5722",
			contrastText: "#000",
		},
		success: { main: "#69F0AE", light: "#B9F6CA", dark: "#00E676" },
		warning: { main: "#FFD54F", light: "#FFECB3", dark: "#FFB300" },
		error: { main: "#FF8A80", light: "#FFCCBC", dark: "#FF5252" },
		background: {
			default: "#0B1C26",
			paper: "#102530",
		},
		text: { primary: "#E0F7FA", secondary: "#80DEEA" },
	},
	typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#0B1C26" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(24, 255, 255, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: { borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.3)", background: "#102530" },
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#102530" } },
		},
	},
});
