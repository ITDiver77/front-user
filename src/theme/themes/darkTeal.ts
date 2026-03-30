import { createTheme } from "@mui/material/styles";

export const darkTealTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#00BFA5",
			light: "#5DF2D6",
			dark: "#00897B",
			contrastText: "#000",
		},
		secondary: {
			main: "#80CBC4",
			light: "#B2DFDB",
			dark: "#4DB6AC",
			contrastText: "#000",
		},
		success: {
			main: "#34D399",
			light: "#6EE7B7",
			dark: "#10B981",
		},
		warning: {
			main: "#FBBF24",
			light: "#FCD34D",
			dark: "#F59E0B",
		},
		error: {
			main: "#FB7185",
			light: "#FDA4AF",
			dark: "#F43F5E",
		},
		background: {
			default: "#121212",
			paper: "#1E1E1E",
		},
		text: {
			primary: "#FFFFFF",
			secondary: "#B0B0B0",
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h1: { fontWeight: 700 },
		h2: { fontWeight: 700 },
		h3: { fontWeight: 600 },
		h4: { fontWeight: 600 },
		h5: { fontWeight: 600 },
		h6: { fontWeight: 600 },
	},
	shape: {
		borderRadius: 12,
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				"*": { boxSizing: "border-box" },
				html: { scrollBehavior: "smooth" },
				body: {
					backgroundColor: "#121212",
					transition: "background-color 0.3s ease",
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					fontWeight: 600,
					borderRadius: 10,
					transition: "all 0.2s ease",
				},
				contained: {
					boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
					background: "linear-gradient(135deg, #00BFA5 0%, #5DF2D6 100%)",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(0, 191, 165, 0.4)",
						background: "linear-gradient(135deg, #00897B 0%, #00BFA5 100%)",
					},
				},
				outlined: {
					background: "transparent",
					border: "1.5px solid #00BFA5",
					color: "#00BFA5",
					"&:hover": {
						background: "rgba(0, 191, 165, 0.12)",
						border: "1.5px solid #00897B",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
					transition: "all 0.3s ease",
					background: "#1E1E1E",
					"&:hover": {
						boxShadow: "0 4px 20px rgba(0, 191, 165, 0.15)",
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					background: "#1E1E1E",
				},
				rounded: {
					borderRadius: 12,
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontWeight: 500,
					borderRadius: 8,
					color: "#5DF2D6",
				},
				colorSuccess: {
					background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
					color: "#fff",
				},
				colorWarning: {
					background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
					color: "#000",
				},
				colorError: {
					background: "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)",
					color: "#fff",
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 10,
						transition: "all 0.2s ease",
						"&:hover": {
							boxShadow: "0 2px 8px rgba(0, 191, 165, 0.15)",
						},
					},
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					transition: "all 0.2s ease",
					"&:hover": {
						transform: "scale(1.05)",
					},
					"&:active": {
						transform: "scale(0.95)",
					},
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					background: "linear-gradient(135deg, #00BFA5 0%, #00897B 100%)",
					boxShadow: "0 2px 12px rgba(0, 191, 165, 0.25)",
				},
			},
		},
		MuiBottomNavigation: {
			styleOverrides: {
				root: {
					height: 60,
					background: "#1E1E1E",
				},
			},
		},
		MuiBottomNavigationAction: {
			styleOverrides: {
				root: {
					"&.Mui-selected": {
						"& .MuiBottomNavigationAction-label": {
							fontWeight: 600,
						},
					},
				},
			},
		},
	},
});
