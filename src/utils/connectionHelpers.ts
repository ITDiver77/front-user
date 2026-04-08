import type { Connection } from "../types/connection";

export function getCopyValue(connection: Connection): string | null {
	if (connection.subscription_url) return connection.subscription_url;
	if (connection.connection_string) return connection.connection_string;
	return null;
}
