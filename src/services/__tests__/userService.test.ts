import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { userService } from "../../services/userService";
import {
	getCapturedRequests,
	resetCapturedRequests,
	server,
} from "../../test/msw/handlers";

// Mock import.meta.env for axios
vi.stubGlobal("importMeta", {
	env: { VITE_API_BASE_URL: "http://localhost:8000/api/v1" },
});

describe("userService", () => {
	beforeAll(() => server.listen());
	afterAll(() => server.close());
	beforeEach(() => {
		resetCapturedRequests();
	});

	describe("getMyProfile", () => {
		it("should fetch current user profile", async () => {
			const profile = await userService.getMyProfile();

			expect(profile.id).toBe(1);
			expect(profile.username).toBe("testuser");
			expect(profile.telegram_id).toBe(123456789);
			expect(profile.telegram_verified).toBe(true);
		});
	});

	describe("updateProfile", () => {
		it("should update user profile with telegram_id", async () => {
			const updated = await userService.updateProfile({
				telegram_id: 987654321,
			});

			expect(updated.telegram_id).toBe(987654321);

			const requests = getCapturedRequests();
			expect(requests.updateProfile).toEqual({ telegram_id: 987654321 });
		});

		it("should allow clearing telegram_id by passing null", async () => {
			const updated = await userService.updateProfile({ telegram_id: null });

			expect(updated.telegram_id).toBeNull();

			const requests = getCapturedRequests();
			expect(requests.updateProfile).toEqual({ telegram_id: null });
		});
	});

	describe("deleteAccount", () => {
		it("should send delete account request", async () => {
			await userService.deleteAccount();

			const requests = getCapturedRequests();
			expect(requests.deleteAccount).toBe(true);
		});
	});
});
