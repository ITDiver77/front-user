import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { connectionService } from "../../services/connectionService";
import {
	getCapturedRequests,
	resetCapturedRequests,
	server,
} from "../../test/msw/handlers";

// Mock import.meta.env for axios
vi.stubGlobal("importMeta", {
	env: { VITE_API_BASE_URL: "http://localhost:8000/api/v1" },
});

describe("connectionService", () => {
	beforeAll(() => server.listen());
	afterAll(() => server.close());
	beforeEach(() => {
		resetCapturedRequests();
	});

	describe("getMyConnections", () => {
		it("should fetch all connections for current user", async () => {
			const connections = await connectionService.getMyConnections();

			expect(connections).toHaveLength(1);
			expect(connections[0].connection_name).toBe("testuser-1");
			expect(connections[0].server_name).toBe("US-West");
			expect(connections[0].enabled).toBe(true);
			expect(connections[0].is_active).toBe(true);
		});

		it("should include connection details", async () => {
			const connections = await connectionService.getMyConnections();

			expect(connections[0].short_id).toBe("abc123");
			expect(connections[0].price).toBe(5);
			expect(connections[0].paydate).toBe("2026-04-01");
			expect(connections[0].connection_string).toContain("vless://");
			expect(connections[0].auto_renew).toBe(true);
		});
	});

	describe("getConnection", () => {
		it("should fetch connection by name", async () => {
			const connection = await connectionService.getConnection("testuser-1");

			expect(connection.connection_name).toBe("testuser-1");
		});

		it("should throw error for non-existent connection", async () => {
			await expect(
				connectionService.getConnection("nonexistent"),
			).rejects.toThrow();
		});
	});

	describe("createConnection", () => {
		it("should create new connection", async () => {
			const connection = await connectionService.createConnection({
				server_name: "US-West",
				months: 1,
			});

			expect(connection).toBeDefined();
			expect(connection.server_name).toBe("US-West");

			const requests = getCapturedRequests();
			expect(requests.createConnection).toEqual({
				server_name: "US-West",
				months: 1,
			});
		});
	});

	describe("updateConnection", () => {
		it("should update connection settings", async () => {
			const connection = await connectionService.updateConnection(
				"testuser-1",
				{
					auto_renew: false,
				},
			);

			expect(connection.auto_renew).toBe(false);

			const requests = getCapturedRequests();
			expect(requests.updateConnection).toEqual({
				name: "testuser-1",
				auto_renew: false,
			});
		});
	});

	describe("deleteConnection", () => {
		it("should delete connection by name", async () => {
			await connectionService.deleteConnection("testuser-1");

			const requests = getCapturedRequests();
			expect(requests.deleteConnection).toBe("testuser-1");
		});
	});

	describe("toggleAutoRenew", () => {
		it("should toggle auto-renew for connection", async () => {
			const connection = await connectionService.toggleAutoRenew(
				"testuser-1",
				false,
			);

			expect(connection.auto_renew).toBe(false);

			const requests = getCapturedRequests();
			expect(requests.updateConnection).toEqual({
				name: "testuser-1",
				auto_renew: false,
			});
		});
	});

	describe("toggleEnabled", () => {
		it("should toggle enabled state for connection", async () => {
			const connection = await connectionService.toggleEnabled(
				"testuser-1",
				false,
			);

			expect(connection.enabled).toBe(false);

			const requests = getCapturedRequests();
			expect(requests.updateConnection).toEqual({
				name: "testuser-1",
				enabled: false,
			});
		});

		it("should enable connection", async () => {
			await connectionService.toggleEnabled("testuser-1", true);

			const requests = getCapturedRequests();
			expect(requests.updateConnection).toEqual({
				name: "testuser-1",
				enabled: true,
			});
		});
	});

	describe("changeServer", () => {
		it("should change server for connection", async () => {
			const connection = await connectionService.changeServer(
				"testuser-1",
				"EU-Central",
			);

			expect(connection.server_name).toBe("EU-Central");

			const requests = getCapturedRequests();
			expect(requests.changeServer).toEqual({
				name: "testuser-1",
				new_server_name: "EU-Central",
			});
		});
	});
});
