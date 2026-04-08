import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
	ApiError: class ApiError extends Error {
		status?: number;
		data?: unknown;
		constructor(status: number | undefined, message: string, data?: unknown) {
			super(message);
			this.name = "ApiError";
			this.status = status;
			this.data = data;
		}
	},
}));

import api from "../api";
import { userService } from "../userService";

const mockApi = api as any;

const mockUser = {
	id: 1,
	username: "testuser",
	telegram_id: 123456789,
	telegram_verified: true,
	created_at: "2025-01-01T00:00:00Z",
};

describe("userService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getMyProfile", () => {
		it("should fetch current user profile", async () => {
			mockApi.get.mockResolvedValue({ data: mockUser });
			const profile = await userService.getMyProfile();

			expect(profile.id).toBe(1);
			expect(profile.username).toBe("testuser");
			expect(profile.telegram_id).toBe(123456789);
			expect(profile.telegram_verified).toBe(true);
		});
	});

	describe("updateProfile", () => {
		it("should update user profile with telegram_id", async () => {
			mockApi.put.mockResolvedValue({
				data: { ...mockUser, telegram_id: 987654321 },
			});
			const updated = await userService.updateProfile({
				telegram_id: 987654321,
			});

			expect(updated.telegram_id).toBe(987654321);
			expect(mockApi.put).toHaveBeenCalledWith("/users/me", {
				telegram_id: 987654321,
			});
		});

		it("should allow clearing telegram_id by passing null", async () => {
			mockApi.put.mockResolvedValue({
				data: { ...mockUser, telegram_id: null },
			});
			const updated = await userService.updateProfile({
				telegram_id: null,
			});

			expect(updated.telegram_id).toBeNull();
			expect(mockApi.put).toHaveBeenCalledWith("/users/me", {
				telegram_id: null,
			});
		});
	});

	describe("deleteAccount", () => {
		it("should send delete account request", async () => {
			mockApi.delete.mockResolvedValue({});
			await userService.deleteAccount();

			expect(mockApi.delete).toHaveBeenCalledWith("/users/me");
		});
	});
});
