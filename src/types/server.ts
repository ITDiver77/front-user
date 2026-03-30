export interface Server {
	id: number;
	name: string;
	host: string;
	port: number;
	api_key: string;
	region: string;
	is_default: boolean;
	max_users: number;
	is_active: boolean;
	created_at: string;
	active_connections?: number;
	total_connections?: number;
	is_deleted?: boolean;
	deleted_at?: string | null;
}

export interface ServerListResponse {
	servers: Server[];
	total: number;
}
