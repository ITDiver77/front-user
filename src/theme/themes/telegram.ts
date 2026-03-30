import { createTheme, type PaletteOptions } from "@mui/material/styles";

export interface TelegramThemeParams {
	bg_color?: string;
	text_color?: string;
	hint_color?: string;
	link_color?: string;
	button_color?: string;
	button_text_color?: string;
	secondary_bg_color?: string;
}

const lightPalette: PaletteOptions = {
	mode: "light",
	primary: {
		main: "#3390EC",
		light: "#5CA4F0",
		dark: "#2B7DD2",
		contrastText: "#fff",
	},
	secondary: {
		main: "#8774E1",
		light: "#A99DF0",
		dark: "#6B5CBD",
		contrastText: "#fff",
	},
	success: {
		main: "#4CAF50",
		light: "#81C784",
		dark: "#388E3C",
	},
	warning: {
		main: "#FF9800",
		light: "#FFB74D",
		dark: "#F57C00",
	},
	error: {
		main: "#E53935",
		light: "#EF5350",
		dark: "#C62828",
	},
	background: {
		default: "#FFFFFF",
		paper: "#FFFFFF",
	},
	text: {
		primary: "#000000",
		secondary: "#707579",
	},
};

const darkPalette: PaletteOptions = {
	mode: "dark",
	primary: {
		main: "#3390EC",
		light: "#5CA4F0",
		dark: "#2B7DD2",
		contrastText: "#fff",
	},
	secondary: {
		main: "#8774E1",
		light: "#A99DF0",
		dark: "#6B5CBD",
		contrastText: "#fff",
	},
	success: {
		main: "#4CAF50",
		light: "#81C784",
		dark: "#388E3C",
	},
	warning: {
		main: "#FF9800",
		light: "#FFB74D",
		dark: "#F57C00",
	},
	error: {
		main: "#E53935",
		light: "#EF5350",
		dark: "#C62828",
	},
	background: {
		default: "#17212B",
		paper: "#232E3C",
	},
	text: {
		primary: "#FFFFFF",
		secondary: "#AAAAAA",
	},
};

export function createTelegramTheme(
	params: TelegramThemeParams,
	isDark: boolean = false,
) {
	const basePalette = isDark ? darkPalette : lightPalette;

	const primaryMain = params.button_color || "#3390EC";
	const bgDefault = params.bg_color || "#FFFFFF";
	const bgPaper = params.secondary_bg_color || "#FFFFFF";
	const textPrimary = params.text_color || "#000000";
	const textSecondary = params.hint_color || "#707579";

	const palette: PaletteOptions = {
		mode: isDark ? "dark" : "light",
		primary: {
			main: primaryMain,
			light: primaryMain,
			dark: primaryMain,
			contrastText: params.button_text_color || "#fff",
		},
		secondary: basePalette.secondary,
		success: basePalette.success,
		warning: basePalette.warning,
		error: basePalette.error,
		background: {
			default: bgDefault,
			paper: bgPaper,
		},
		text: {
			primary: textPrimary,
			secondary: textSecondary,
		},
	};

	return createTheme({
		palette,
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
						backgroundColor: bgDefault,
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
						background: primaryMain,
						color: params.button_text_color || "#fff",
						"&:hover": {
							transform: "translateY(-1px)",
							boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
							opacity: 0.9,
						},
					},
					outlined: {
						background: "transparent",
						border: `1.5px solid ${primaryMain}`,
						color: primaryMain,
						"&:hover": {
							background: "rgba(51, 144, 236, 0.08)",
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
						background: bgPaper,
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
						background: primaryMain,
						color: params.button_text_color || "#fff",
						boxShadow: "0 2px 12px rgba(51, 144, 236, 0.25)",
					},
				},
			},
			MuiBottomNavigation: {
				styleOverrides: {
					root: {
						height: 60,
						background: bgPaper,
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
}

export const telegramLightTheme = createTelegramTheme({}, false);
export const telegramDarkTheme = createTelegramTheme({}, true);
