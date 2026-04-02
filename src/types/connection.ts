export interface Connection {
	id: number;
	username: string;
	index: number;
	connection_name: string;
	short_id: string;
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
}

export interface ConnectionCreateRequest {
	username: string;
	index?: number;
	short_id?: string;
	price: number;
	paydate: string;
	enabled?: boolean;
	connection_string?: string;
	auto_renew?: boolean;
	server_name?: string;
}

export interface ConnectionUpdateRequest {
	username?: string;
	index?: number;
	short_id?: string;
	price?: number;
	paydate?: string;
	enabled?: boolean;
	is_active?: boolean;
	connection_string?: string;
	auto_renew?: boolean;
	server_name?: string;
}

export interface ChangeServerRequest {
	new_server_name: string;
}
