import { createTheme } from "@mui/material/styles";

export const indigoSlateTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#8C9EFF",
			light: "#B0BEC5",
			dark: "#5C6BC0",
			contrastText: "#000",
		},
		secondary: {
			main: "#80DEEA",
			light: "#B2EBF2",
			dark: "#4DD0E1",
			contrastText: "#000",
		},
		success: { main: "#80CBC4", light: "#B2DFDB", dark: "#4DB6AC" },
		warning: { main: "#FFB74D", light: "#FFE0B2", dark: "#FFA726" },
		error: { main: "#EF9A9A", light: "#FFCCBC", dark: "#E57373" },
		background: {
			default: "#151922",
			paper: "#1E242C",
		},
		text: { primary: "#ECEFF1", secondary: "#90A4AE" },
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#151922" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #8C9EFF 0%, #5C6BC0 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(140, 158, 255, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
					background: "#1E242C",
				},
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#1E242C" } },
		},
	},
});
