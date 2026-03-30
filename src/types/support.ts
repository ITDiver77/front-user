export interface SupportMessage {
	id: number;
	conversation_id: number;
	user_id: number | null;
	message: string;
	is_from_admin: boolean;
	read_at: string | null;
	created_at: string;
}

export interface SupportConversation {
	id: number;
	user_id: number;
	status: "open" | "closed";
	created_at: string;
	updated_at: string;
	messages: SupportMessage[];
}

export interface ConversationListItem {
	id: number;
	user_id: number;
	status: "open" | "closed";
	created_at: string;
	updated_at: string;
	last_message: string | null;
	last_message_at: string | null;
	has_unread_answers?: boolean;
}

export interface CreateConversationRequest {
	message: string;
}

export interface SendMessageRequest {
	message: string;
}
