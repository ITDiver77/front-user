import { createTheme, type Theme, ThemeProvider } from "@mui/material/styles";
import React, {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { amberGoldTheme } from "./themes/amberGold";
import { brownCoffeeTheme } from "./themes/brownCoffee";
import { cyanBlueTheme } from "./themes/cyanBlue";
import { darkBlueTheme } from "./themes/darkBlue";
import { darkPurpleTheme } from "./themes/darkPurple";
import { darkTealTheme } from "./themes/darkTeal";
import { greenMintTheme } from "./themes/greenMint";
import { greySteelTheme } from "./themes/greySteel";
import { indigoSlateTheme } from "./themes/indigoSlate";
import { lightTheme } from "./themes/light";
import { limeGreenTheme } from "./themes/limeGreen";
import { orangeDeepTheme } from "./themes/orangeDeep";
import { pinkPurpleTheme } from "./themes/pinkPurple";
import { redCrimsonTheme } from "./themes/redCrimson";
import { rosePinkTheme } from "./themes/rosePink";
import { tealTheme } from "./themes/teal";
import { createTelegramTheme } from "./themes/telegram";
import { violetTheme } from "./themes/violet";
import type { TelegramThemeParams, ThemeName } from "./types";

interface ThemeContextValue {
	themeName: ThemeName;
	setThemeName: (name: ThemeName) => void;
	isDark: boolean;
	isTelegram: boolean;
	telegramThemeParams: TelegramThemeParams | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "vpn-user-theme";

function getInitialTheme(): ThemeName {
	if (typeof window === "undefined") return "violet";
	const stored = localStorage.getItem(THEME_STORAGE_KEY);
	const validThemes = [
		"violet",
		"teal",
		"telegram",
		"light",
		"dark",
		"darkBlue",
		"darkPurple",
		"darkTeal",
		"amberGold",
		"greenMint",
		"rosePink",
		"indigoSlate",
		"orangeDeep",
		"cyanBlue",
		"redCrimson",
		"limeGreen",
		"brownCoffee",
		"pinkPurple",
		"greySteel",
	];
	if (stored && validThemes.includes(stored)) {
		return stored as ThemeName;
	}
	return "violet";
}

function detectTelegramTheme(): {
	isTelegram: boolean;
	params: TelegramThemeParams | null;
	isDark: boolean;
} {
	if (typeof window === "undefined") {
		return { isTelegram: false, params: null, isDark: false };
	}

	const tg = (window as any).Telegram?.WebApp;
	if (!tg) {
		return { isTelegram: false, params: null, isDark: false };
	}

	const params: TelegramThemeParams = {
		bg_color: tg.themeParams?.bg_color,
		text_color: tg.themeParams?.text_color,
		hint_color: tg.themeParams?.hint_color,
		link_color: tg.themeParams?.link_color,
		button_color: tg.themeParams?.button_color,
		button_text_color: tg.themeParams?.button_text_color,
		secondary_bg_color: tg.themeParams?.secondary_bg_color,
	};

	const isDark = tg.colorScheme === "dark";

	return { isTelegram: true, params, isDark };
}

interface CustomThemeProviderProps {
	children: ReactNode;
}

export function CustomThemeProvider({ children }: CustomThemeProviderProps) {
	const [themeName, setThemeNameState] = useState<ThemeName>(getInitialTheme);
	const [telegramState, setTelegramState] = useState<{
		isTelegram: boolean;
		params: TelegramThemeParams | null;
		isDark: boolean;
	}>({
		isTelegram: false,
		params: null,
		isDark: false,
	});

	useEffect(() => {
		const detected = detectTelegramTheme();
		setTelegramState(detected);

		// Auto-switch to telegram theme if in Telegram and theme is default
		if (detected.isTelegram && themeName === "violet") {
			setThemeNameState("telegram");
		}
	}, [themeName]);

	useEffect(() => {
		// Listen for Telegram theme changes
		const tg = (window as any).Telegram?.WebApp;
		if (tg?.onEvent) {
			const handleThemeChange = () => {
				const detected = detectTelegramTheme();
				setTelegramState(detected);
			};
			tg.onEvent("themeChanged", handleThemeChange);
			return () => tg.offEvent("themeChanged", handleThemeChange);
		}
	}, []);

	const setThemeName = (name: ThemeName) => {
		setThemeNameState(name);
		localStorage.setItem(THEME_STORAGE_KEY, name);
	};

	const theme: Theme = useMemo(() => {
		switch (themeName) {
			case "violet":
				return violetTheme;
			case "teal":
				return tealTheme;
			case "telegram":
				if (telegramState.isTelegram && telegramState.params) {
					return createTelegramTheme(
						telegramState.params,
						telegramState.isDark,
					);
				}
				return createTelegramTheme({}, false);
			case "light":
				return lightTheme;
			case "dark":
				return createTheme({
					...lightTheme,
					palette: { mode: "dark" },
				});
			case "darkBlue":
				return darkBlueTheme;
			case "darkPurple":
				return darkPurpleTheme;
			case "darkTeal":
				return darkTealTheme;
			case "amberGold":
				return amberGoldTheme;
			case "greenMint":
				return greenMintTheme;
			case "rosePink":
				return rosePinkTheme;
			case "indigoSlate":
				return indigoSlateTheme;
			case "orangeDeep":
				return orangeDeepTheme;
			case "cyanBlue":
				return cyanBlueTheme;
			case "redCrimson":
				return redCrimsonTheme;
			case "limeGreen":
				return limeGreenTheme;
			case "brownCoffee":
				return brownCoffeeTheme;
			case "pinkPurple":
				return pinkPurpleTheme;
			case "greySteel":
				return greySteelTheme;
			default:
				return violetTheme;
		}
	}, [themeName, telegramState]);

	const darkThemes = [
		"dark",
		"darkBlue",
		"darkPurple",
		"darkTeal",
		"amberGold",
		"greenMint",
		"indigoSlate",
		"orangeDeep",
		"cyanBlue",
		"redCrimson",
		"brownCoffee",
		"pinkPurple",
		"greySteel",
	];

	const contextValue: ThemeContextValue = {
		themeName,
		setThemeName,
		isDark:
			themeName === "telegram"
				? telegramState.isDark
				: darkThemes.includes(themeName),
		isTelegram: telegramState.isTelegram,
		telegramThemeParams: telegramState.params,
	};

	return (
		<ThemeContext.Provider value={contextValue}>
			<ThemeProvider theme={theme}>{children}</ThemeProvider>
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a CustomThemeProvider");
	}
	return context;
}

export { ThemeContext };
