import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import type { TelegramRegisterResponse, User } from "../types/user";

type AuthUser = Pick<User, "username" | "telegram_verified">;

interface AuthContextType {
	isAuthenticated: boolean;
	loading: boolean;
	user: AuthUser | null;
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
	updateUser: (userData: Partial<AuthUser>) => void;
	setAuthFromToken: (token: string) => Promise<void>;
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
	const [user, setUser] = useState<AuthUser | null>(null);

	const saveUserData = useCallback(
		(userData: StoredUserData, rememberMe: boolean) => {
			const data = JSON.stringify(userData);
			if (rememberMe) {
				localStorage.setItem(STORAGE_KEY, data);
				sessionStorage.removeItem(STORAGE_KEY);
			} else {
				sessionStorage.setItem(STORAGE_KEY, data);
				localStorage.removeItem(STORAGE_KEY);
			}
		},
		[],
	);

	const clearUserData = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY);
		sessionStorage.removeItem(STORAGE_KEY);
	}, []);

	useEffect(() => {
		const restoreSession = async () => {
			const tg = window.Telegram?.WebApp;
			if (tg?.initData) {
				try {
					const urlParams = new URLSearchParams(window.location.search);
					const referrerId = urlParams.get("ref") || undefined;
					const result = await authService.telegramWebAppAuth(
						tg.initData,
						referrerId,
					);
					localStorage.setItem("token", result.access_token);
					if (result.login_token) {
						localStorage.setItem("vpn_login_token", result.login_token);
					}
					const profile = await userService.getMyProfile();
					setUser({
						username: profile.username,
						telegram_verified: profile.telegram_verified,
					});
					setIsAuthenticated(true);
					setLoading(false);
					return;
				} catch (e) {
					console.error("Telegram WebApp auth failed", e);
				}
			}
			const token =
				localStorage.getItem("token") || sessionStorage.getItem("token");
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const profile = await userService.getMyProfile();
				setUser({
					username: profile.username,
					telegram_verified: profile.telegram_verified,
				});
				setIsAuthenticated(true);
			} catch (e) {
				console.error("Invalid token or session expired", e);
				localStorage.removeItem("token");
				sessionStorage.removeItem("token");
				localStorage.removeItem(STORAGE_KEY);
				sessionStorage.removeItem(STORAGE_KEY);

				const savedLoginToken = localStorage.getItem("vpn_login_token");
				if (savedLoginToken) {
					try {
						const tokenResult = await authService.loginByToken(savedLoginToken);
						if (tokenResult.login_token) {
							localStorage.setItem("vpn_login_token", tokenResult.login_token);
						}
						localStorage.setItem("token", tokenResult.access_token);
						const profile = await userService.getMyProfile();
						setUser({
							username: profile.username,
							telegram_verified: profile.telegram_verified,
						});
						setIsAuthenticated(true);
						return;
					} catch {
						localStorage.removeItem("vpn_login_token");
					}
				}
			} finally {
				setLoading(false);
			}
		};

		restoreSession();
	}, []);

	const storeToken = useCallback((token: string, rememberMe: boolean) => {
		if (rememberMe) {
			localStorage.setItem("token", token);
		} else {
			sessionStorage.setItem("token", token);
		}
	}, []);

	const clearToken = useCallback(() => {
		localStorage.removeItem("token");
		sessionStorage.removeItem("token");
	}, []);

	const login = useCallback(
		async (
			username: string,
			password: string,
			rememberMe: boolean,
		): Promise<boolean> => {
			try {
				const response = await authService.login({ username, password });
				storeToken(response.access_token, rememberMe);
				saveUserData({ username }, rememberMe);
				setIsAuthenticated(true);
				setUser({ username, telegram_verified: false });
				return true;
			} catch (error) {
				console.error("Login failed", error);
				return false;
			}
		},
		[storeToken, saveUserData],
	);

	const register = useCallback(
		async (
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

				if ("temp_password" in response) {
					return {
						success: true,
						telegramResponse: response as TelegramRegisterResponse,
					};
				}

				storeToken(response.access_token, true);
				saveUserData({ username }, true);
				setIsAuthenticated(true);
				setUser({ username, telegram_verified: false });
				return { success: true };
			} catch (error) {
				console.error("Registration failed", error);
				return { success: false };
			}
		},
		[storeToken, saveUserData],
	);

	const logout = useCallback(() => {
		clearToken();
		clearUserData();
		localStorage.removeItem("vpn_login_token");
		setIsAuthenticated(false);
		setUser(null);
	}, [clearToken, clearUserData]);

	const forgotPassword = useCallback(
		async (username: string): Promise<boolean> => {
			try {
				await authService.forgotPassword({ username });
				return true;
			} catch (error) {
				console.error("Forgot password request failed", error);
				return false;
			}
		},
		[],
	);

	const resetPassword = useCallback(
		async (token: string, newPassword: string): Promise<boolean> => {
			try {
				await authService.resetPassword({ token, new_password: newPassword });
				return true;
			} catch (error) {
				console.error("Reset password failed", error);
				return false;
			}
		},
		[],
	);

	const changePassword = useCallback(
		async (oldPassword: string, newPassword: string): Promise<boolean> => {
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
		},
		[],
	);

	const updateUser = useCallback(
		(userData: Partial<AuthUser>) => {
			setUser((prev) => {
				if (!prev) return null;
				const updated = { ...prev, ...userData };
				const rememberMe = !!localStorage.getItem("token");
				saveUserData(updated, rememberMe);
				return updated;
			});
		},
		[saveUserData],
	);

	const setAuthFromToken = useCallback(async (token: string) => {
		try {
			localStorage.setItem("token", token);
			sessionStorage.removeItem("token");
			const profile = await userService.getMyProfile();
			setUser({
				username: profile.username,
				telegram_verified: profile.telegram_verified,
			});
			setIsAuthenticated(true);
			setLoading(false);
		} catch (e) {
			console.error("Invalid token", e);
		}
	}, []);

	const value = useMemo<AuthContextType>(
		() => ({
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
			setAuthFromToken,
		}),
		[
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
			setAuthFromToken,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
