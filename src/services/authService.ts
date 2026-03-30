import type {
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
	username: string;
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
	username: string;
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
		} catch (error: any) {
			throw new Error(error.message || "Login failed");
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
		} catch (error: any) {
			throw new Error(error.message || "Registration start failed");
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
		} catch (error: any) {
			throw new Error(error.message || "Registration failed");
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
		} catch (error: any) {
			throw new Error(error.message || "Forgot password request failed");
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
		} catch (error: any) {
			throw new Error(error.message || "Password reset failed");
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
		} catch (error: any) {
			throw new Error(error.message || "Password change failed");
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
		} catch (error: any) {
			throw new Error(error.message || "Failed to get registration status");
		}
	},
};
