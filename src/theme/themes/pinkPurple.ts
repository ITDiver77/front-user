import { createTheme } from "@mui/material/styles";

export const pinkPurpleTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#F48FB1",
			light: "#F8BBD9",
			dark: "#EC407A",
			contrastText: "#000",
		},
		secondary: {
			main: "#CE93D8",
			light: "#E1BEE7",
			dark: "#AB47BC",
			contrastText: "#000",
		},
		success: { main: "#81C784", light: "#A5D6A7", dark: "#66BB6A" },
		warning: { main: "#FFD54F", light: "#FFECB3", dark: "#FFB300" },
		error: { main: "#EF9A9A", light: "#FFCCBC", dark: "#E57373" },
		background: {
			default: "#1A1016",
			paper: "#251820",
		},
		text: { primary: "#FCE4EC", secondary: "#F48FB1" },
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#1A1016" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #F48FB1 0%, #EC407A 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(244, 143, 177, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
					background: "#251820",
				},
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#251820" } },
		},
	},
});
