import type {
	ConnectionsUsedResponse,
	PendingEmailChangeResponse,
	ReferralsResponse,
	StartEmailChangeResponse,
	TelegramRebindResponse,
	User,
	UserPriceResponse,
	UserUpdateRequest,
	VerifyEmailChangeResponse,
} from "../types/user";
import api from "./api";

export const userService = {
	/**
	 * Get current user profile (requires JWT)
	 * @returns {Promise<User>} Current user data
	 * @throws {Error} When network error or API error occurs
	 */
	getMyProfile: async () => {
		try {
			const response = await api.get<User>("/users/me");
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to fetch user profile: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Update current user profile
	 * @param {UserUpdateRequest} data - Profile update data (first_name, last_name, display_name)
	 * @returns {Promise<User>} Updated user data
	 * @throws {Error} When network error, API error, or validation fails
	 */
	updateProfile: async (data: UserUpdateRequest) => {
		try {
			const response = await api.put<User>("/users/me", data);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Start Telegram rebind flow
	 * @returns {Promise<TelegramRebindResponse>} Rebind token and link
	 * @throws {Error} When network error or API error occurs
	 */
	rebindTelegram: async () => {
		try {
			const response = await api.post<TelegramRebindResponse>(
				"/users/me/telegram/rebind",
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to start Telegram rebind: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Get current user's price for new connection
	 * @returns {Promise<UserPriceResponse>} Price information
	 * @throws {Error} When network error or API error occurs
	 */
	getUserPrice: async () => {
		try {
			const response = await api.get<UserPriceResponse>("/users/me/price");
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to fetch user price: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Delete current user account (soft delete)
	 * @throws {Error} When network error or API error occurs
	 */
	deleteAccount: async () => {
		try {
			await api.delete("/users/me");
		} catch (error: unknown) {
			throw new Error(
				`Failed to delete account: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Get count of connections used by current user
	 * @returns {Promise<ConnectionsUsedResponse>} Number of connections used
	 * @throws {Error} When network error or API error occurs
	 */
	getConnectionsUsed: async () => {
		try {
			const response = await api.get<ConnectionsUsedResponse>(
				"/users/me/connections-used",
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to fetch connections used: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Start email change flow - sends verification code to new email
	 * @param {string} email - New email address
	 * @returns {Promise<StartEmailChangeResponse>} Confirmation with masked email
	 * @throws {Error} When network error or API error occurs
	 */
	startEmailChange: async (email: string) => {
		try {
			const response = await api.post<StartEmailChangeResponse>(
				"/me/email/start",
				{ email },
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to start email change: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Verify email change with 4-digit code
	 * @param {string} code - 4-digit verification code
	 * @returns {Promise<VerifyEmailChangeResponse>} Verification result
	 * @throws {Error} When network error or API error occurs
	 */
	verifyEmailChange: async (code: string) => {
		try {
			const response = await api.post<VerifyEmailChangeResponse>(
				"/me/email/verify",
				{ code },
			);
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to verify email change: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Cancel pending email change
	 * @throws {Error} When network error or API error occurs
	 */
	cancelEmailChange: async () => {
		try {
			await api.post("/me/email/cancel");
		} catch (error: unknown) {
			throw new Error(
				`Failed to cancel email change: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Get pending email change status
	 * @returns {Promise<PendingEmailChangeResponse>} Pending status info
	 * @throws {Error} When network error or API error occurs
	 */
	getPendingEmailChange: async () => {
		try {
			const response =
				await api.get<PendingEmailChangeResponse>("/me/email/pending");
			return response.data;
		} catch (error: unknown) {
			throw new Error(
				`Failed to get pending email change: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	getReferrals: async () => {
		const response = await api.get<ReferralsResponse>("/users/me/referrals");
		return response.data;
	},
};
