import type {
	Connection,
	ConnectionCreateRequest,
	ConnectionUpdateRequest,
	Inbound,
	ReenableConnectionResponse,
	SwitchInboundResponse,
} from "../types/connection";
import api from "./api";

export const connectionService = {
	// Get connections for the current user (requires JWT)
	getMyConnections: async () => {
		const response = await api.get<Connection[]>("/connections/my");
		return response.data;
	},

	// Get connection by name (must belong to current user)
	getConnection: async (connectionName: string) => {
		const response = await api.get<Connection>(
			`/connections/my/${connectionName}`,
		);
		return response.data;
	},

	// Create connection for current user
	createConnection: async (connectionData: ConnectionCreateRequest) => {
		const response = await api.post<Connection>(
			"/connections/my",
			connectionData,
		);
		return response.data;
	},

	// Update connection (must belong to current user)
	updateConnection: async (
		connectionName: string,
		connectionData: ConnectionUpdateRequest,
	) => {
		const response = await api.put<Connection>(
			`/connections/my/${connectionName}`,
			connectionData,
		);
		return response.data;
	},

	deleteConnection: async (connectionName: string) => {
		await api.delete(`/connections/my/${connectionName}`);
	},

	// Toggle auto-renew (dedicated endpoint - does NOT affect VPN connection state)
	toggleAutoRenew: async (connectionName: string, autoRenew: boolean) => {
		const response = await api.post<{
			connection_name: string;
			auto_renew: boolean;
		}>(`/connections/my/${connectionName}/toggle-auto-renew`, {
			auto_renew: autoRenew,
		});
		return response.data;
	},

	// Toggle enabled/disabled state
	toggleEnabled: async (connectionName: string, enabled: boolean) => {
		const response = await api.put<Connection>(
			`/connections/my/${connectionName}`,
			{ enabled },
		);
		return response.data;
	},

	// Change server for connection
	changeServer: async (connectionName: string, newServerName: string) => {
		const response = await api.post<Connection>(
			`/connections/my/${connectionName}/change-server`,
			{ new_server_name: newServerName },
		);
		return response.data;
	},

	// Request grace period for unpaid connection
	requestGrace: async (connectionName: string) => {
		const response = await api.post<{
			connection_name: string;
			grace_date: string;
			message: string;
		}>(`/connections/my/${connectionName}/request-grace`, {});
		return response.data;
	},

	/**
	 * Update connection with full update (PUT /connections/my/{name})
	 *
	 * @param connectionName - The name of the connection to update
	 * @param connectionData - The updated connection data
	 * @returns The updated connection object
	 */
	updateMyConnection: async (
		connectionName: string,
		connectionData: ConnectionUpdateRequest,
	): Promise<Connection> => {
		const response = await api.put<Connection>(
			`/connections/my/${connectionName}`,
			connectionData,
		);
		return response.data;
	},

	previewSlotChange: async (
		connectionName: string,
		maxConnections: number,
	): Promise<{
		current_price: number;
		new_price: number;
		current_paydate: string | null;
		new_paydate: string | null;
		days_remaining: number | null;
		new_days_remaining: number | null;
	}> => {
		const response = await api.get(
			`/connections/my/${connectionName}/slot-preview`,
			{ params: { max_connections: maxConnections } },
		);
		return response.data;
	},

	/**
	 * Cancel deletion for a connection marked for deletion
	 *
	 * @param connectionName - The name of the connection to cancel deletion for
	 */
	cancelDeletion: async (connectionName: string): Promise<void> => {
		await api.post(`/connections/my/${connectionName}/cancel-delete`);
	},

	reenableConnection: async (connectionName: string) => {
		const response = await api.post<ReenableConnectionResponse>(
			`/connections/my/${connectionName}/reenable`,
		);
		return response.data;
	},

	getAvailableInbounds: async (connectionName: string) => {
		const response = await api.get<Inbound[]>(
			`/connections/my/${connectionName}/available-inbounds`,
		);
		return response.data;
	},

	switchInbound: async (connectionName: string, inboundId: number) => {
		const response = await api.post<SwitchInboundResponse>(
			`/connections/my/${connectionName}/switch-inbound`,
			{ inbound_id: inboundId },
		);
		return response.data;
	},
};
