import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	authService,
	ChangePasswordRequest,
	ForgotPasswordRequest,
	LoginRequest,
	RegisterRequest,
	ResetPasswordRequest,
} from "../services/authService";
import type { TelegramRegisterResponse } from "../types/user";

interface User {
	username: string;
	telegram_verified?: boolean;
}

interface AuthContextType {
	isAuthenticated: boolean;
	loading: boolean;
	user: User | null;
	login: (
		username: string,
		password: string,
		rememberMe: boolean,
	) => Promise<boolean>;
	register: (
		username: string,
		password: string,
		telegramId?: number,
	) => Promise<{
		success: boolean;
		telegramResponse?: TelegramRegisterResponse;
	}>;
	logout: () => void;
	forgotPassword: (username: string) => Promise<boolean>;
	resetPassword: (token: string, newPassword: string) => Promise<boolean>;
	changePassword: (
		oldPassword: string,
		newPassword: string,
	) => Promise<boolean>;
	updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

const STORAGE_KEY = "vpn_user_data";

interface StoredUserData {
	username: string;
	telegram_verified?: boolean;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	const loadUserData = (): StoredUserData | null => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				return null;
			}
		}
		const sessionStored = sessionStorage.getItem(STORAGE_KEY);
		if (sessionStored) {
			try {
				return JSON.parse(sessionStored);
			} catch {
				return null;
			}
		}
		return null;
	};

	const saveUserData = (userData: StoredUserData, rememberMe: boolean) => {
		const data = JSON.stringify(userData);
		if (rememberMe) {
			localStorage.setItem(STORAGE_KEY, data);
			sessionStorage.removeItem(STORAGE_KEY);
		} else {
			sessionStorage.setItem(STORAGE_KEY, data);
			localStorage.removeItem(STORAGE_KEY);
		}
	};

	const clearUserData = () => {
		localStorage.removeItem(STORAGE_KEY);
		sessionStorage.removeItem(STORAGE_KEY);
	};

	useEffect(() => {
		const token =
			localStorage.getItem("token") || sessionStorage.getItem("token");
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split(".")[1]));
				const storedUser = loadUserData();
				setUser({
					username: payload.sub || payload.username,
					telegram_verified: storedUser?.telegram_verified,
				});
				setIsAuthenticated(true);
			} catch (e) {
				console.error("Invalid token", e);
				localStorage.removeItem("token");
				sessionStorage.removeItem("token");
			}
		}
		setLoading(false);
	}, []);

	const storeToken = (token: string, rememberMe: boolean) => {
		if (rememberMe) {
			localStorage.setItem("token", token);
		} else {
			sessionStorage.setItem("token", token);
		}
	};

	const clearToken = () => {
		localStorage.removeItem("token");
		sessionStorage.removeItem("token");
	};

	const login = async (
		username: string,
		password: string,
		rememberMe: boolean,
	): Promise<boolean> => {
		try {
			const response = await authService.login({ username, password });
			storeToken(response.access_token, rememberMe);
			saveUserData({ username }, rememberMe);
			setIsAuthenticated(true);
			setUser({ username });
			return true;
		} catch (error) {
			console.error("Login failed", error);
			return false;
		}
	};

	const register = async (
		username: string,
		password: string,
		telegramId?: number,
	): Promise<{
		success: boolean;
		telegramResponse?: TelegramRegisterResponse;
	}> => {
		try {
			const response = await authService.register({
				username,
				password,
				telegram_id: telegramId,
			});

			// Check if this is a telegram registration response
			if ("temp_password" in response) {
				// Telegram registration - no auto-login, return response for display
				return {
					success: true,
					telegramResponse: response as TelegramRegisterResponse,
				};
			}

			// Standard registration - store token and login
			storeToken(response.access_token, true);
			saveUserData({ username }, true);
			setIsAuthenticated(true);
			setUser({ username });
			return { success: true };
		} catch (error) {
			console.error("Registration failed", error);
			return { success: false };
		}
	};

	const logout = () => {
		clearToken();
		clearUserData();
		setIsAuthenticated(false);
		setUser(null);
	};

	const forgotPassword = async (username: string): Promise<boolean> => {
		try {
			await authService.forgotPassword({ username });
			return true;
		} catch (error) {
			console.error("Forgot password request failed", error);
			return false;
		}
	};

	const resetPassword = async (
		token: string,
		newPassword: string,
	): Promise<boolean> => {
		try {
			await authService.resetPassword({ token, new_password: newPassword });
			return true;
		} catch (error) {
			console.error("Reset password failed", error);
			return false;
		}
	};

	const changePassword = async (
		oldPassword: string,
		newPassword: string,
	): Promise<boolean> => {
		try {
			await authService.changePassword({
				old_password: oldPassword,
				new_password: newPassword,
			});
			return true;
		} catch (error) {
			console.error("Change password failed", error);
			return false;
		}
	};

	const updateUser = (userData: Partial<User>) => {
		setUser((prev) => {
			if (!prev) return null;
			const updated = { ...prev, ...userData };
			const rememberMe = !!localStorage.getItem("token");
			saveUserData(updated, rememberMe);
			return updated;
		});
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				loading,
				user,
				login,
				register,
				logout,
				forgotPassword,
				resetPassword,
				changePassword,
				updateUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
