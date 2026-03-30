export interface User {
	id: number;
	username: string;
	first_name?: string | null;
	last_name?: string | null;
	display_name?: string | null;
	telegram_id: number | null;
	telegram_verified: boolean;
	created_at: string;
	is_deleted?: boolean;
	deleted_at?: string | null;
}

export interface UserUpdateRequest {
	first_name?: string | null;
	last_name?: string | null;
	display_name?: string | null;
	telegram_id?: number | null;
}

export interface TelegramRegisterResponse {
	success: boolean;
	username: string;
	temp_password: string;
	connection_name: string;
	connection_string: string;
	site_link: string;
}

export interface RegisterStartResponse {
	telegram_link: string;
	registration_token: string;
	message: string;
}
