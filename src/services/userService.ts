import type { User, UserUpdateRequest } from "../types/user";
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
		} catch (error) {
			const err = error as any;
			throw new Error(`Failed to fetch user profile: ${err.message}`);
		}
	},

	/**
	 * Update current user profile
	 * @param {UserUpdateRequest} data - Profile update data (telegram_id)
	 * @returns {Promise<User>} Updated user data
	 * @throws {Error} When network error, API error, or validation fails
	 */
	updateProfile: async (data: UserUpdateRequest) => {
		try {
			const response = await api.put<User>("/users/me", data);
			return response.data;
		} catch (error) {
			const err = error as any;
			throw new Error(`Failed to update profile: ${err.message}`);
		}
	},

	/**
	 * Delete current user account (soft delete)
	 * @throws {Error} When network error or API error occurs
	 */
	deleteAccount: async () => {
		try {
			await api.delete("/users/me");
		} catch (error) {
			const err = error as any;
			throw new Error(`Failed to delete account: ${err.message}`);
		}
	},
};
