import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { en } from "./translations/en";
import { ru } from "./translations/ru";

export type Language = "ru" | "en";

type TranslationDict = typeof ru;

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

const translations: Record<Language, TranslationDict> = { ru, en };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
	const keys = path.split(".");
	let current: unknown = obj;
	for (const key of keys) {
		if (current && typeof current === "object" && key in current) {
			current = (current as Record<string, unknown>)[key];
		} else {
			return path;
		}
	}
	return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<Language>(() => {
		const stored = localStorage.getItem("language");
		return stored === "en" || stored === "ru" ? stored : "ru";
	});

	useEffect(() => {
		localStorage.setItem("language", language);
	}, [language]);

	const setLanguage = (lang: Language) => {
		setLanguageState(lang);
	};

	const t = (key: string, params?: Record<string, string | number>): string => {
		let value = getNestedValue(
			translations[language] as unknown as Record<string, unknown>,
			key,
		);
		if (params) {
			Object.entries(params).forEach(([paramKey, paramValue]) => {
				value = value.replace(
					new RegExp(`\\{${paramKey}\\}`, "g"),
					String(paramValue),
				);
			});
		}
		return value;
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage(): LanguageContextType {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
