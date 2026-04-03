export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Payment {
	id: number;
	user_id: number;
	amount: number;
	payment_date: string;
	period_days: number;
	payment_method: string;
	notes: string | null;
	status: PaymentStatus;
}

export interface PaymentListResponse {
	payments: Payment[];
	total: number;
	total_amount: number;
	limit: number;
	offset: number;
}

export interface PaymentCreateRequest {
	user_id: number;
	amount: number;
	period_days: number;
	payment_method?: string;
	notes?: string | null;
}

export interface PaymentInitiationRequest {
	connection_name?: string;
	server_name?: string;
	months: number;
	payment_method?: string;
	grace_period?: boolean;
	max_connections?: number;
}

export interface PaymentInitiationResponse {
	payment_id: number | null;
	transaction_id: string | null;
	status: string;
	redirect_url: string | null;
	expires_in?: number;
	payment_details?: unknown;
	connection_name?: string;
	message?: string;
}
