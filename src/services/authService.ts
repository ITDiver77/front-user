import type {
	EmailRegisterStartResponse,
	EmailVerificationResponse,
	LoginByTokenResponse,
	RegisterStartResponse,
	RegistrationStatusResponse,
	TelegramRegisterResponse,
} from "../types/user";
import api from "./api";

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegisterStartRequest {
	username?: string;
	referrer_id?: string;
}

export interface EmailRegisterStartRequest {
	username: string;
	email: string;
	referrer_id?: string;
}

export interface EmailVerifyCodeRequest {
	code: string;
}

export interface RegisterRequest {
	username: string;
	password: string;
	telegram_id?: number;
}

export interface AuthResponse {
	access_token: string;
	token_type: string;
}

export interface ForgotPasswordRequest {
	username?: string;
	email?: string;
}

export interface ResetPasswordRequest {
	token: string;
	new_password: string;
}

export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}

export const authService = {
	/**
	 * Authenticate user with username and password
	 * @param data Login credentials
	 * @returns Authentication token response
	 * @throws {Error} On network or API error with descriptive message
	 */
	async login(data: LoginRequest): Promise<AuthResponse> {
		try {
			const response = await api.post<AuthResponse>("/auth/login", data);
			return response.data;
		} catch (error: unknown) {
			throw new Error(error instanceof Error ? error.message : "Login failed");
		}
	},

	/**
	 * Start registration flow - initiates Telegram verification
	 * @param data Username for registration
	 * @returns Telegram link and registration token
	 * @throws {Error} On network or API error with descriptive message
	 */
	async registerStart(
		data: RegisterStartRequest,
	): Promise<RegisterStartResponse> {
		try {
			const response = await api.post<RegisterStartResponse>(
				"/auth/register/start",
				data,
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error ? error.message : "Registration start failed",
			);
		}
	},

	/**
	 * Register new user account (legacy endpoint, prefer registerStart)
	 * @param data Registration details
	 * @returns Authentication token response (standard) or Telegram registration response
	 * @throws {Error} On network or API error with descriptive message
	 */
	async register(
		data: RegisterRequest,
	): Promise<AuthResponse | TelegramRegisterResponse> {
		try {
			const response = await api.post<AuthResponse | TelegramRegisterResponse>(
				"/auth/register",
				data,
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error ? error.message : "Registration failed",
			);
		}
	},

	/**
	 * Start email registration flow - sends verification code to email
	 * @param data Username and email for registration
	 * @returns Confirmation message
	 * @throws {Error} On network or API error with descriptive message
	 */
	async startEmailRegistration(
		data: EmailRegisterStartRequest,
	): Promise<EmailRegisterStartResponse> {
		try {
			const response = await api.post<EmailRegisterStartResponse>(
				"/auth/register/start/email",
				data,
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error
					? error.message
					: "Email registration start failed",
			);
		}
	},

	/**
	 * Verify email registration with 4-digit code
	 * @param code 4-digit verification code
	 * @returns Verification result with credentials if successful
	 * @throws {Error} On network or API error with descriptive message
	 */
	async verifyEmailCode(code: string, password?: string): Promise<EmailVerificationResponse> {
		try {
			const response = await api.post<EmailVerificationResponse>(
				"/auth/register/verify/code",
				{ code, password },
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error ? error.message : "Email verification failed",
			);
		}
	},

	/**
	 * Verify email registration with token from email link
	 * @param token Verification token from email link
	 * @returns Verification result with credentials if successful
	 * @throws {Error} On network or API error with descriptive message
	 */
	async verifyEmailLink(token: string): Promise<EmailVerificationResponse> {
		try {
			const response = await api.get<EmailVerificationResponse>(
				`/auth/register/verify/${token}`,
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error ? error.message : "Email verification failed",
			);
		}
	},

	/**
	 * Request password reset email/link for given username
	 * @param data Username identifier
	 * @throws {Error} On network or API error with descriptive message
	 */
	async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
		try {
			await api.post("/auth/restore", data);
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error
					? error.message
					: "Forgot password request failed",
			);
		}
	},

	/**
	 * Reset password using token from email
	 * @param data Token and new password
	 * @throws {Error} On network or API error with descriptive error message
	 */
	async resetPassword(data: ResetPasswordRequest): Promise<void> {
		try {
			await api.post("/auth/reset", data);
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error ? error.message : "Password reset failed",
			);
		}
	},

	/**
	 * Change password for authenticated user
	 * @param data Old and new passwords
	 * @throws {Error} On network or API error with descriptive message
	 */
	async changePassword(data: ChangePasswordRequest): Promise<void> {
		try {
			await api.post("/auth/change-password", data);
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error ? error.message : "Password change failed",
			);
		}
	},

	/**
	 * Get registration status for Telegram verification polling
	 * @param registrationToken Token from registerStart
	 * @returns Status of registration (pending or completed with credentials)
	 * @throws {Error} On network or API error with descriptive message
	 */
	async getRegistrationStatus(
		registrationToken: string,
	): Promise<RegistrationStatusResponse> {
		try {
			const response = await api.get<RegistrationStatusResponse>(
				`/auth/register/status/${registrationToken}`,
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error
					? error.message
					: "Failed to get registration status",
			);
		}
	},

	/**
	 * Authenticate user with a login token
	 * @param loginToken Login token for authentication
	 * @returns Authentication token and username
	 * @throws {Error} On network or API error with descriptive message
	 */
	async loginByToken(loginToken: string): Promise<LoginByTokenResponse> {
		try {
			const response = await api.post<LoginByTokenResponse>(
				"/auth/login-by-token",
				{ login_token: loginToken },
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error ? error.message : "Login by token failed",
			);
		}
	},

	async telegramWebAppAuth(
		initData: string,
		referrerId?: string,
	): Promise<LoginByTokenResponse & { is_new?: boolean; password?: string }> {
		try {
			const response = await api.post<
				LoginByTokenResponse & { is_new?: boolean; password?: string }
			>("/auth/telegram-webapp", {
				init_data: initData,
				referrer_id: referrerId || undefined,
			});
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error
					? error.message
					: "Telegram WebApp auth failed",
			);
		}
	},

	async telegramLoginVerify(
		params: Record<string, string>,
	): Promise<LoginByTokenResponse & { is_new?: boolean; password?: string }> {
		try {
			const response = await api.post<
				LoginByTokenResponse & { is_new?: boolean; password?: string }
			>("/auth/telegram-login-verify", params);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error
					? error.message
					: "Telegram login verification failed",
			);
		}
	},

	async telegramIdTokenAuth(
		idToken: string,
		referrerId?: string,
	): Promise<LoginByTokenResponse & { is_new?: boolean; password?: string }> {
		try {
			const response = await api.post<
				LoginByTokenResponse & { is_new?: boolean; password?: string }
			>("/auth/telegram-id-token", {
				id_token: idToken,
				referrer_id: referrerId || undefined,
			});
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				error instanceof Error
					? error.message
					: "Telegram authentication failed",
			);
		}
	},
};
