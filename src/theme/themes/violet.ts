import { createTheme } from "@mui/material/styles";

export const violetTheme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#8B5CF6",
			light: "#A78BFA",
			dark: "#7C3AED",
			contrastText: "#fff",
		},
		secondary: {
			main: "#F472B6",
			light: "#F9A8D4",
			dark: "#EC4899",
			contrastText: "#fff",
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
			default: "#FAF5FF",
			paper: "#fff",
		},
		text: {
			primary: "#1F2937",
			secondary: "#6B7280",
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
					backgroundColor: "#FAF5FF",
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
					boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
					background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
						background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
					},
				},
				outlined: {
					background: "transparent",
					border: "1.5px solid #8B5CF6",
					color: "#8B5CF6",
					"&:hover": {
						background: "rgba(139, 92, 246, 0.08)",
						border: "1.5px solid #7C3AED",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
					transition: "all 0.3s ease",
					"&:hover": {
						boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 12,
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
					color: "#A78BFA",
				},
				colorSuccess: {
					background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
					color: "#fff",
				},
				colorWarning: {
					background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
					color: "#fff",
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
							boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
					background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
					boxShadow: "0 2px 12px rgba(139, 92, 246, 0.25)",
				},
			},
		},
		MuiBottomNavigation: {
			styleOverrides: {
				root: {
					height: 60,
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
