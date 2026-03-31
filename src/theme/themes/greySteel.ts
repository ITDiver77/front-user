import { createTheme } from "@mui/material/styles";

export const greySteelTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#90A4AE",
			light: "#B0BEC5",
			dark: "#607D8B",
			contrastText: "#000",
		},
		secondary: {
			main: "#FF8A65",
			light: "#FFCCBC",
			dark: "#FF5722",
			contrastText: "#000",
		},
		success: { main: "#81C784", light: "#A5D6A7", dark: "#66BB6A" },
		warning: { main: "#FFB74D", light: "#FFE0B2", dark: "#FFA726" },
		error: { main: "#EF9A9A", light: "#FFCCBC", dark: "#E57373" },
		background: {
			default: "#1C2020",
			paper: "#252A2A",
		},
		text: { primary: "#ECEFF1", secondary: "#90A4AE" },
	},
	typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#1C2020" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #90A4AE 0%, #607D8B 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(144, 164, 174, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: { borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.3)", background: "#252A2A" },
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#252A2A" } },
		},
	},
});
