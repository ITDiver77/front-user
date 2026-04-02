import { createTheme } from "@mui/material/styles";

export const lavenderTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#7E57C2",
			light: "#B39DDB",
			dark: "#5E35B1",
			contrastText: "#fff",
		},
		secondary: {
			main: "#AB47BC",
			light: "#CE93D8",
			dark: "#8E24AA",
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
			default: "#EDE7F6",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#4527A0",
			secondary: "#673AB7",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
	},
	shape: { borderRadius: 12 },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: "#EDE7F6" },
			},
		},
		MuiButton: {
			styleOverrides: {
				root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
				contained: {
					background: "linear-gradient(135deg, #7E57C2 0%, #5E35B1 100%)",
					color: "#fff",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(126, 87, 194, 0.4)",
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
