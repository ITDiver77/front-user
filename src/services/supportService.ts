import type {
	ConversationListItem,
	CreateConversationRequest,
	SendMessageRequest,
	SupportConversation,
} from "../types/support";
import api from "./api";

export const supportService = {
	/**
	 * Create a new support conversation with an initial message
	 * @param {string} message - Initial message for the conversation
	 * @returns {Promise<SupportConversation>} Created conversation with messages
	 */
	createConversation: async (message: string) => {
		const response = await api.post<SupportConversation>(
			"/support/conversations",
			{ message } as CreateConversationRequest,
		);
		return response.data;
	},

	/**
	 * Get list of all conversations for the current user
	 * @returns {Promise<ConversationListItem[]>} List of user's conversations
	 */
	getConversations: async () => {
		const response = await api.get<{ conversations: ConversationListItem[]; total: number; skip: number; limit: number }>(
			"/support/conversations",
		);
		return response.data.conversations;
	},

	/**
	 * Get a single conversation with all its messages
	 * @param {number} id - Conversation ID
	 * @returns {Promise<SupportConversation>} Conversation with messages
	 */
	getConversation: async (id: number) => {
		const response = await api.get<SupportConversation>(
			`/support/conversations/${id}`,
		);
		return response.data;
	},

	/**
	 * Send a message to an existing conversation
	 * @param {number} conversationId - Conversation ID
	 * @param {string} message - Message text to send
	 * @returns {Promise<SupportConversation>} Updated conversation with messages
	 */
	sendMessage: async (conversationId: number, message: string) => {
		const response = await api.post<SupportConversation>(
			`/support/conversations/${conversationId}/messages`,
			{ message } as SendMessageRequest,
		);
		return response.data;
	},

	/**
	 * Close a support conversation
	 * @param {number} conversationId - Conversation ID to close
	 * @returns {Promise<SupportConversation>} Updated conversation with closed status
	 */
	closeConversation: async (conversationId: number) => {
		const response = await api.post<SupportConversation>(
			`/support/conversations/${conversationId}/close`,
		);
		return response.data;
	},

	/**
	 * Delete a support conversation
	 * @param {number} conversationId - Conversation ID to delete
	 */
	deleteConversation: async (conversationId: number) => {
		await api.delete(`/support/conversations/${conversationId}`);
	},
};
