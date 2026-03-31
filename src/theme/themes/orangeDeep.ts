import { createTheme } from "@mui/material/styles";

export const orangeDeepTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#FFB74D",
			light: "#FFE0B2",
			dark: "#F57C00",
			contrastText: "#000",
		},
		secondary: {
			main: "#4DB6AC",
			light: "#80CBC4",
			dark: "#00897B",
			contrastText: "#000",
		},
		success: { main: "#81C784", light: "#A5D6A7", dark: "#66BB6A" },
		warning: { main: "#FFD54F", light: "#FFECB3", dark: "#FFB300" },
		error: { main: "#EF5350", light: "#EF9A9A", dark: "#E53935" },
		background: {
			default: "#1C1814",
			paper: "#2A231E",
		},
		text: { primary: "#FFF8E1", secondary: "#BCAAA4" },
	},
	typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#1C1814" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #FFB74D 0%, #F57C00 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(255, 183, 77, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: { borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.3)", background: "#2A231E" },
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#2A231E" } },
		},
	},
});
