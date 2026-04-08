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
import { serverService } from "../serverService";

const mockApi = api as any;

const mockServers = [
	{
		id: 1,
		name: "US-West",
		host: "us.example.com",
		port: 51820,
		api_key: "",
		region: "US",
		is_default: true,
		max_users: 100,
		is_active: true,
		created_at: "",
	},
	{
		id: 2,
		name: "EU-Central",
		host: "eu.example.com",
		port: 51820,
		api_key: "",
		region: "EU",
		is_default: false,
		max_users: 100,
		is_active: true,
		created_at: "",
	},
];

describe("serverService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getActiveServers", () => {
		it("should fetch list of active servers", async () => {
			mockApi.get.mockResolvedValue({ data: mockServers });
			const servers = await serverService.getActiveServers();

			expect(servers).toHaveLength(2);
			expect(servers[0].name).toBe("US-West");
			expect(servers[1].name).toBe("EU-Central");
			servers.forEach((server) => {
				expect(server.is_active).toBe(true);
			});
		});

		it("should include region and other server details", async () => {
			mockApi.get.mockResolvedValue({ data: mockServers });
			const servers = await serverService.getActiveServers();

			expect(servers[0].region).toBe("US");
			expect(servers[0].host).toBe("us.example.com");
			expect(servers[0].port).toBe(51820);
			expect(servers[0].is_default).toBe(true);
		});
	});

	describe("getServer", () => {
		it("should fetch server by name", async () => {
			mockApi.get.mockResolvedValue({ data: mockServers[0] });
			const server = await serverService.getServer("US-West");

			expect(server.name).toBe("US-West");
			expect(server.region).toBe("US");
		});

		it("should throw error for non-existent server", async () => {
			mockApi.get.mockRejectedValue(new Error("Not found"));
			await expect(serverService.getServer("NonExistent")).rejects.toThrow();
		});
	});
});
