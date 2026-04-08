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
import { authService } from "../authService";

const mockApi = api as any;

describe("authService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		sessionStorage.clear();
	});

	describe("login", () => {
		it("should send login request with username and password", async () => {
			mockApi.post.mockResolvedValue({
				data: { access_token: "mock-jwt-token", token_type: "bearer" },
			});
			const response = await authService.login({
				username: "testuser",
				password: "password123",
			});

			expect(response.access_token).toBe("mock-jwt-token");
			expect(response.token_type).toBe("bearer");
			expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
				username: "testuser",
				password: "password123",
			});
		});

		it("should throw error on failed login", async () => {
			mockApi.post.mockRejectedValue(new Error("Invalid credentials"));

			await expect(
				authService.login({ username: "wrong", password: "wrong" }),
			).rejects.toThrow("Invalid credentials");
		});
	});

	describe("registerStart", () => {
		it("should start registration and return telegram link", async () => {
			mockApi.post.mockResolvedValue({
				data: {
					telegram_link: "https://t.me/MyVPNBot?start=newuser_token",
					registration_token: "newuser_token",
					message: "Please verify your account via Telegram bot",
				},
			});
			const response = await authService.registerStart({
				username: "newuser",
			});

			expect(response.telegram_link).toContain("t.me/MyVPNBot");
			expect(response.registration_token).toContain("newuser");
			expect(response.message).toBe(
				"Please verify your account via Telegram bot",
			);
			expect(mockApi.post).toHaveBeenCalledWith("/auth/register/start", {
				username: "newuser",
			});
		});

		it("should throw error when registration start fails", async () => {
			mockApi.post.mockRejectedValue(new Error("Username already exists"));

			await expect(
				authService.registerStart({ username: "existing" }),
			).rejects.toThrow("Username already exists");
		});
	});

	describe("forgotPassword", () => {
		it("should send forgot password request", async () => {
			mockApi.post.mockResolvedValue({
				data: {
					message: "Password reset instructions will be sent if account exists",
				},
			});
			await authService.forgotPassword({ username: "testuser" });

			expect(mockApi.post).toHaveBeenCalledWith("/auth/restore", {
				username: "testuser",
			});
		});
	});

	describe("resetPassword", () => {
		it("should send reset password request with token and new password", async () => {
			mockApi.post.mockResolvedValue({
				data: { message: "Password reset successful" },
			});
			await authService.resetPassword({
				token: "reset_token_123",
				new_password: "newPassword123",
			});

			expect(mockApi.post).toHaveBeenCalledWith("/auth/reset", {
				token: "reset_token_123",
				new_password: "newPassword123",
			});
		});
	});

	describe("changePassword", () => {
		it("should send change password request with old and new password", async () => {
			mockApi.post.mockResolvedValue({
				data: { message: "Password changed successfully" },
			});
			await authService.changePassword({
				old_password: "oldPassword123",
				new_password: "newPassword456",
			});

			expect(mockApi.post).toHaveBeenCalledWith("/auth/change-password", {
				old_password: "oldPassword123",
				new_password: "newPassword456",
			});
		});

		it("should throw error when old password is incorrect", async () => {
			mockApi.post.mockRejectedValue(
				new Error("Current password is incorrect"),
			);

			await expect(
				authService.changePassword({
					old_password: "wrong",
					new_password: "newPass123",
				}),
			).rejects.toThrow("Current password is incorrect");
		});
	});
});
