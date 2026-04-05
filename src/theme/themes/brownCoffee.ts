import { createTheme } from "@mui/material/styles";

export const brownCoffeeTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#BCAAA4",
			light: "#D7CCC8",
			dark: "#8D6E63",
			contrastText: "#000",
		},
		secondary: {
			main: "#80CBC4",
			light: "#B2DFDB",
			dark: "#4DB6AC",
			contrastText: "#000",
		},
		success: { main: "#81C784", light: "#A5D6A7", dark: "#66BB6A" },
		warning: { main: "#FFB74D", light: "#FFE0B2", dark: "#FFA726" },
		error: { main: "#EF9A9A", light: "#FFCCBC", dark: "#E57373" },
		background: {
			default: "#1A1512",
			paper: "#2D2520",
		},
		text: { primary: "#EFEBE9", secondary: "#BCAAA4" },
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: { body: { backgroundColor: "#1A1512" } },
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #BCAAA4 0%, #8D6E63 100%)",
					color: "#000",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(188, 170, 164, 0.4)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
					background: "#2D2520",
				},
			},
		},
		MuiPaper: {
			styleOverrides: { root: { borderRadius: 12, background: "#2D2520" } },
		},
	},
});
