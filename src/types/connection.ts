export interface Connection {
	id: number;
	username: string;
	index: number;
	connection_name: string;
	client_uuid: string;
	price: number;
	paydate: string;
	grace_date: string | null;
	enabled: boolean;
	is_active: boolean;
	created_at: string;
	connection_string?: string;
	auto_renew?: boolean;
	server_name?: string;
	is_deleted?: boolean;
	deleted_at?: string | null;
	max_connections?: number;
	marked_for_deletion?: boolean;
	subscription_token?: string;
	subscription_url?: string | null;
	status?: string;
}

export interface ConnectionCreateRequest {
	username?: string;
	index?: number;
	paydate?: string;
	enabled?: boolean;
	connection_string?: string;
	auto_renew?: boolean;
	server_name?: string;
	max_connections?: number;
}

export interface ConnectionUpdateRequest {
	index?: number;
	paydate?: string;
	enabled?: boolean;
	is_active?: boolean;
	connection_string?: string;
	auto_renew?: boolean;
	server_name?: string;
	max_connections?: number;
	marked_for_deletion?: boolean;
}

export interface ChangeServerRequest {
	new_server_name: string;
}
