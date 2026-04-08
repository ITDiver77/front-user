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
import { connectionService } from "../connectionService";

const mockApi = api as any;

const mockConnection = {
	id: 1,
	username: "testuser",
	index: 0,
	connection_name: "testuser-1",
	client_uuid: "550e8400-e29b-41d4-a716-446655440000",
	price: 5,
	paydate: "2026-04-01",
	enabled: true,
	is_active: true,
	created_at: "2026-01-01T00:00:00Z",
	connection_string: "vless://abc123@testserver.com:443",
	auto_renew: true,
	server_name: "US-West",
	subscription_token: "sub_test_token_abc123",
	subscription_url: "https://mythicalvpn.cloudns.nz/sub/sub_test_token_abc123",
	status: "active",
};

describe("connectionService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getMyConnections", () => {
		it("should fetch all connections for current user", async () => {
			mockApi.get.mockResolvedValue({ data: [mockConnection] });
			const connections = await connectionService.getMyConnections();

			expect(connections).toHaveLength(1);
			expect(connections[0].connection_name).toBe("testuser-1");
			expect(connections[0].server_name).toBe("US-West");
			expect(connections[0].enabled).toBe(true);
			expect(connections[0].is_active).toBe(true);
		});

		it("should include connection details", async () => {
			mockApi.get.mockResolvedValue({ data: [mockConnection] });
			const connections = await connectionService.getMyConnections();

			expect(connections[0].client_uuid).toBe(
				"550e8400-e29b-41d4-a716-446655440000",
			);
			expect(connections[0].price).toBe(5);
			expect(connections[0].paydate).toBe("2026-04-01");
			expect(connections[0].connection_string).toContain("vless://");
			expect(connections[0].auto_renew).toBe(true);
		});
	});

	describe("getConnection", () => {
		it("should fetch connection by name", async () => {
			mockApi.get.mockResolvedValue({ data: mockConnection });
			const connection = await connectionService.getConnection("testuser-1");

			expect(connection.connection_name).toBe("testuser-1");
		});

		it("should throw error for non-existent connection", async () => {
			mockApi.get.mockRejectedValue(new Error("Not found"));
			await expect(
				connectionService.getConnection("nonexistent"),
			).rejects.toThrow();
		});
	});

	describe("createConnection", () => {
		it("should create new connection", async () => {
			mockApi.post.mockResolvedValue({
				data: { ...mockConnection, server_name: "US-West" },
			});
			const connection = await connectionService.createConnection({
				server_name: "US-West",
			});

			expect(connection).toBeDefined();
			expect(connection.server_name).toBe("US-West");
			expect(mockApi.post).toHaveBeenCalledWith("/connections/my", {
				server_name: "US-West",
			});
		});
	});

	describe("updateConnection", () => {
		it("should update connection settings", async () => {
			mockApi.put.mockResolvedValue({
				data: { ...mockConnection, auto_renew: false },
			});
			const connection = await connectionService.updateConnection(
				"testuser-1",
				{
					auto_renew: false,
				},
			);

			expect(connection.auto_renew).toBe(false);
			expect(mockApi.put).toHaveBeenCalledWith("/connections/my/testuser-1", {
				auto_renew: false,
			});
		});
	});

	describe("deleteConnection", () => {
		it("should delete connection by name", async () => {
			mockApi.delete.mockResolvedValue({});
			await connectionService.deleteConnection("testuser-1");

			expect(mockApi.delete).toHaveBeenCalledWith("/connections/my/testuser-1");
		});
	});

	describe("toggleAutoRenew", () => {
		it("should toggle auto-renew for connection", async () => {
			mockApi.post.mockResolvedValue({
				data: { connection_name: "testuser-1", auto_renew: false },
			});
			const connection = await connectionService.toggleAutoRenew(
				"testuser-1",
				false,
			);

			expect(connection.auto_renew).toBe(false);
			expect(mockApi.post).toHaveBeenCalledWith(
				"/connections/my/testuser-1/toggle-auto-renew",
				{ auto_renew: false },
			);
		});
	});

	describe("toggleEnabled", () => {
		it("should toggle enabled state for connection", async () => {
			mockApi.put.mockResolvedValue({
				data: { ...mockConnection, enabled: false },
			});
			const connection = await connectionService.toggleEnabled(
				"testuser-1",
				false,
			);

			expect(connection.enabled).toBe(false);
			expect(mockApi.put).toHaveBeenCalledWith("/connections/my/testuser-1", {
				enabled: false,
			});
		});

		it("should enable connection", async () => {
			mockApi.put.mockResolvedValue({
				data: { ...mockConnection, enabled: true },
			});
			await connectionService.toggleEnabled("testuser-1", true);

			expect(mockApi.put).toHaveBeenCalledWith("/connections/my/testuser-1", {
				enabled: true,
			});
		});
	});

	describe("changeServer", () => {
		it("should change server for connection", async () => {
			mockApi.post.mockResolvedValue({
				data: { ...mockConnection, server_name: "EU-Central" },
			});
			const connection = await connectionService.changeServer(
				"testuser-1",
				"EU-Central",
			);

			expect(connection.server_name).toBe("EU-Central");
			expect(mockApi.post).toHaveBeenCalledWith(
				"/connections/my/testuser-1/change-server",
				{ new_server_name: "EU-Central" },
			);
		});

		it("should call user-scoped endpoint /connections/my/:name/change-server", async () => {
			mockApi.post.mockResolvedValue({
				data: { ...mockConnection, server_name: "EU-Central" },
			});
			await connectionService.changeServer("testuser-1", "EU-Central");

			expect(mockApi.post).toHaveBeenCalledWith(
				"/connections/my/testuser-1/change-server",
				{ new_server_name: "EU-Central" },
			);
		});
	});

	describe("getMyConnections - subscription fields", () => {
		it("should include subscription_url in connection data", async () => {
			mockApi.get.mockResolvedValue({ data: [mockConnection] });
			const connections = await connectionService.getMyConnections();

			expect(connections[0]).toHaveProperty("subscription_url");
			expect(connections[0].subscription_url).toBe(
				"https://mythicalvpn.cloudns.nz/sub/sub_test_token_abc123",
			);
		});

		it("should include subscription_token in connection data", async () => {
			mockApi.get.mockResolvedValue({ data: [mockConnection] });
			const connections = await connectionService.getMyConnections();

			expect(connections[0]).toHaveProperty("subscription_token");
			expect(connections[0].subscription_token).toBe("sub_test_token_abc123");
		});

		it("should include status field in connection data", async () => {
			mockApi.get.mockResolvedValue({ data: [mockConnection] });
			const connections = await connectionService.getMyConnections();

			expect(connections[0]).toHaveProperty("status");
			expect(connections[0].status).toBe("active");
		});
	});
});
