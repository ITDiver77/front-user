import { type Server, ServerListResponse } from "../types/server";
import api from "./api";

export const serverService = {
	/**
	 * Get list of active servers.
	 * Real endpoint: GET /servers/?active_only=true
	 * Backend returns Server[] (array of servers).
	 * @returns Promise<Server[]> list of active servers
	 * @throws {Error} on network or API error (404, 403, 500, etc.)
	 */
	getActiveServers: async (): Promise<Server[]> => {
		const response = await api.get<Server[]>("/servers/", {
			params: { active_only: true },
		});
		return response.data;
	},

	/**
	 * Get server by name.
	 * Real endpoint: GET /servers/{name}
	 * @param serverName - server name identifier
	 * @returns Promise<Server> server object
	 * @throws {Error} when server not found (404) or other API errors
	 */
	getServer: async (serverName: string): Promise<Server> => {
		const response = await api.get<Server>(`/servers/${serverName}`);
		return response.data;
	},
};
