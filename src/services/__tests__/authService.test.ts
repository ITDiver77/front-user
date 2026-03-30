import { rest } from "msw";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { authService } from "../../services/authService";
import {
	getCapturedRequests,
	resetCapturedRequests,
	server,
} from "../../test/msw/handlers";

// Mock import.meta.env for axios
vi.stubGlobal("importMeta", {
	env: { VITE_API_BASE_URL: "http://localhost:8000/api/v1" },
});

describe("authService", () => {
	beforeAll(() => server.listen());
	afterAll(() => server.close());
	beforeEach(() => {
		resetCapturedRequests();
		localStorage.clear();
		sessionStorage.clear();
	});

	describe("login", () => {
		it("should send login request with username and password", async () => {
			const response = await authService.login({
				username: "testuser",
				password: "password123",
			});

			expect(response.access_token).toBe("mock-jwt-token");
			expect(response.token_type).toBe("bearer");

			const requests = getCapturedRequests();
			expect(requests.login).toEqual({
				username: "testuser",
				password: "password123",
			});
		});

		it("should throw error on failed login", async () => {
			server.use(
				rest.post("/api/v1/auth/login", (req, res, ctx) => {
					return res(
						ctx.status(401),
						ctx.json({ detail: "Invalid credentials" }),
					);
				}),
			);

			await expect(
				authService.login({ username: "wrong", password: "wrong" }),
			).rejects.toThrow("Invalid credentials");

			server.resetHandlers();
		});
	});

	describe("registerStart", () => {
		it("should start registration and return telegram link", async () => {
			const response = await authService.registerStart({ username: "newuser" });

			expect(response.telegram_link).toContain("t.me/MyVPNBot");
			expect(response.registration_token).toContain("newuser");
			expect(response.message).toBe(
				"Please verify your account via Telegram bot",
			);

			const requests = getCapturedRequests();
			expect(requests.registerStart).toEqual({ username: "newuser" });
		});

		it("should throw error when registration start fails", async () => {
			server.use(
				rest.post("/api/v1/auth/register/start", (req, res, ctx) => {
					return res(
						ctx.status(400),
						ctx.json({ detail: "Username already exists" }),
					);
				}),
			);

			await expect(
				authService.registerStart({ username: "existing" }),
			).rejects.toThrow("Username already exists");

			server.resetHandlers();
		});
	});

	describe("forgotPassword", () => {
		it("should send forgot password request", async () => {
			await authService.forgotPassword({ username: "testuser" });

			const requests = getCapturedRequests();
			expect(requests.forgotPassword).toEqual({ username: "testuser" });
		});
	});

	describe("resetPassword", () => {
		it("should send reset password request with token and new password", async () => {
			await authService.resetPassword({
				token: "reset_token_123",
				new_password: "newPassword123",
			});

			const requests = getCapturedRequests();
			expect(requests.resetPassword).toEqual({
				token: "reset_token_123",
				new_password: "newPassword123",
			});
		});
	});

	describe("changePassword", () => {
		it("should send change password request with old and new password", async () => {
			await authService.changePassword({
				old_password: "oldPassword123",
				new_password: "newPassword456",
			});

			const requests = getCapturedRequests();
			expect(requests.changePassword).toEqual({
				old_password: "oldPassword123",
				new_password: "newPassword456",
			});
		});

		it("should throw error when old password is incorrect", async () => {
			server.use(
				rest.post("/api/v1/auth/change-password", (req, res, ctx) => {
					return res(
						ctx.status(400),
						ctx.json({ detail: "Current password is incorrect" }),
					);
				}),
			);

			await expect(
				authService.changePassword({
					old_password: "wrong",
					new_password: "newPass123",
				}),
			).rejects.toThrow("Current password is incorrect");

			server.resetHandlers();
		});
	});
});
