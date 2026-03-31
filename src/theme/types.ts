import type { ThemeOptions } from "@mui/material/styles";

export const baseSettings: ThemeOptions = {
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
					backgroundColor: "var(--bg-color, #f5f5f5)",
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
					"&:hover": {
						transform: "translateY(-1px)",
						boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
};

export const cuteShadows = {
	sm: "0 1px 3px rgba(0,0,0,0.08)",
	md: "0 2px 8px rgba(0,0,0,0.1)",
	lg: "0 4px 16px rgba(0,0,0,0.12)",
	xl: "0 8px 32px rgba(0,0,0,0.14)",
};

export const cuteTransitions = {
	fast: "0.15s ease",
	normal: "0.3s ease",
	slow: "0.5s ease",
};

export type ThemeName = "violet" | "teal" | "telegram" | "light" | "dark" | "darkBlue" | "darkPurple" | "darkTeal" | "amberGold" | "greenMint" | "rosePink" | "indigoSlate" | "orangeDeep" | "cyanBlue" | "redCrimson" | "limeGreen" | "brownCoffee" | "pinkPurple" | "greySteel";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
	name: ThemeName;
	label: string;
	description: string;
}

export const availableThemes: ThemeConfig[] = [
	{
		name: "violet",
		label: "Violet",
		description: "Soft purple, cute and modern",
	},
	{ name: "teal", label: "Teal", description: "Fresh and clean" },
	{
		name: "telegram",
		label: "Telegram",
		description: "Matches your Telegram app theme",
	},
	{
		name: "light",
		label: "Classic Light",
		description: "Traditional blue theme",
	},
	{
		name: "darkBlue",
		label: "Dark Blue",
		description: "Dark theme with blue accent",
	},
	{
		name: "darkPurple",
		label: "Dark Purple",
		description: "Dark theme with purple accent",
	},
	{
		name: "darkTeal",
		label: "Dark Teal",
		description: "Dark theme with teal accent",
	},
	{
		name: "amberGold",
		label: "Amber Gold",
		description: "Dark theme with warm amber accent",
	},
	{
		name: "greenMint",
		label: "Green Mint",
		description: "Dark theme with fresh mint accent",
	},
	{
		name: "rosePink",
		label: "Rose Pink",
		description: "Light theme with soft pink accent",
	},
	{
		name: "indigoSlate",
		label: "Indigo Slate",
		description: "Dark theme with indigo blue accent",
	},
	{
		name: "orangeDeep",
		label: "Orange Deep",
		description: "Dark theme with vibrant orange accent",
	},
	{
		name: "cyanBlue",
		label: "Cyan Blue",
		description: "Dark theme with cyan accent",
	},
	{
		name: "redCrimson",
		label: "Red Crimson",
		description: "Dark theme with bold red accent",
	},
	{
		name: "limeGreen",
		label: "Lime Green",
		description: "Light theme with lime green accent",
	},
	{
		name: "brownCoffee",
		label: "Brown Coffee",
		description: "Dark theme with warm brown accent",
	},
	{
		name: "pinkPurple",
		label: "Pink Purple",
		description: "Dark theme with pink-purple accent",
	},
	{
		name: "greySteel",
		label: "Grey Steel",
		description: "Dark theme with grey metallic accent",
	},
];

export interface ThemeContextType {
	themeName: ThemeName;
	setThemeName: (name: ThemeName) => void;
	isDark: boolean;
	isTelegram: boolean;
	telegramThemeParams: TelegramThemeParams | null;
}

export interface TelegramThemeParams {
	bg_color?: string;
	text_color?: string;
	hint_color?: string;
	link_color?: string;
	button_color?: string;
	button_text_color?: string;
	secondary_bg_color?: string;
}
