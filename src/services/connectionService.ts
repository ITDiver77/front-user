import {
	ChangeServerRequest,
	type Connection,
	type ConnectionCreateRequest,
	type ConnectionUpdateRequest,
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
			`/connections/${connectionName}`,
		);
		return response.data;
	},

	// Create connection for current user
	createConnection: async (connectionData: ConnectionCreateRequest) => {
		const response = await api.post<Connection>(
			"/connections/",
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
			`/connections/${connectionName}`,
			connectionData,
		);
		return response.data;
	},

	// Delete connection (must belong to current user)
	deleteConnection: async (connectionName: string) => {
		await api.delete(`/connections/${connectionName}`);
	},

	// Toggle auto-renew (dedicated endpoint - does NOT affect VPN connection state)
	toggleAutoRenew: async (connectionName: string, autoRenew: boolean) => {
		const response = await api.post<{ connection_name: string; auto_renew: boolean }>(
			`/connections/my/${connectionName}/toggle-auto-renew`,
			{ auto_renew: autoRenew },
		);
		return response.data;
	},

	// Toggle enabled/disabled state
	toggleEnabled: async (connectionName: string, enabled: boolean) => {
		const response = await api.put<Connection>(
			`/connections/${connectionName}`,
			{ enabled },
		);
		return response.data;
	},

	// Change server for connection
	changeServer: async (connectionName: string, newServerName: string) => {
		const response = await api.post<Connection>(
			`/connections/${connectionName}/change-server`,
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
		}>(
			`/connections/my/${connectionName}/request-grace`,
			{},
		);
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

	/**
	 * Cancel deletion for a connection marked for deletion
	 *
	 * @param connectionName - The name of the connection to cancel deletion for
	 */
	cancelDeletion: async (connectionName: string): Promise<void> => {
		await api.post(`/connections/my/${connectionName}/cancel-delete`);
	},
};
