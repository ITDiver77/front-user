import type { AxiosError } from "axios";
import type {
	Payment,
	PaymentInitiationRequest,
	PaymentInitiationResponse,
	PaymentListResponse,
} from "../types/payment";
import api from "./api";

export const paymentService = {
	/**
	 * Get payments for the current user.
	 * @param limit - Maximum number of payments to return (default 100)
	 * @param offset - Number of payments to skip (default 0)
	 * @returns Payment list with totals
	 * @throws {Error} If API request fails or payment gateway error
	 */
	getMyPayments: async (limit = 100, offset = 0) => {
		try {
			const response = await api.get<PaymentListResponse>("/payments/", {
				params: { limit, offset },
			});
			return response.data;
		} catch (error) {
			console.error("Failed to fetch payments", error);
			throw new Error(
				`Failed to fetch payments: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Initiate a new payment for connection renewal or new connection.
	 * @param data - Payment initiation request including connection_name and months
	 * @returns Payment initiation response with payment_id and redirect_url
	 * @throws {Error} If payment gateway unreachable, insufficient funds, conflict, etc.
	 */
	initiatePayment: async (data: PaymentInitiationRequest) => {
		try {
			const response = await api.post<PaymentInitiationResponse>(
				"/payments/initiate",
				data,
			);
			return response.data;
		} catch (error) {
			console.error("Failed to initiate payment", error);
			const axiosErr = error as AxiosError;
			const status = axiosErr.status || axiosErr.response?.status;
			if (status === 402) {
				throw new Error("Payment required: insufficient funds");
			}
			if (status === 409) {
				throw new Error("Payment conflict: duplicate transaction");
			}
			if (status === 503) {
				throw new Error("Payment gateway temporarily unavailable");
			}
			throw new Error(
				`Failed to initiate payment: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Get payment status by payment ID.
	 * @param paymentId - Payment ID (transaction ID)
	 * @returns Payment details
	 * @throws {Error} If payment not found, insufficient funds, conflict, etc.
	 */
	getPaymentStatus: async (paymentId: number) => {
		try {
			// Use transaction status endpoint per spec
			const response = await api.get<Payment>(
				`/payments/transaction/${paymentId}/status`,
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch payment status", error);
			const axiosErr = error as AxiosError;
			const status = axiosErr.status || axiosErr.response?.status;
			if (status === 404) {
				throw new Error("Payment not found");
			}
			if (status === 402) {
				throw new Error("Payment failed: insufficient funds");
			}
			if (status === 409) {
				throw new Error("Payment in conflict state");
			}
			throw new Error(
				`Failed to fetch payment status: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	/**
	 * Poll payment status until completed (for UI).
	 * @param paymentId - Payment ID
	 * @param interval - Polling interval in milliseconds (default 2000)
	 * @param maxAttempts - Maximum polling attempts (default 30)
	 * @returns Payment details when payment is completed
	 * @throws {Error} If polling timeout or payment fails
	 */
	pollPaymentStatus: async (
		paymentId: number,
		interval = 2000,
		maxAttempts = 30,
	) => {
		for (let i = 0; i < maxAttempts; i++) {
			await new Promise((resolve) => setTimeout(resolve, interval));
			try {
				const payment = await paymentService.getPaymentStatus(paymentId);
				if (payment.payment_date) {
					return payment;
				}
			} catch (error) {
				console.error("Error polling payment status", error);
				throw error;
			}
		}
		throw new Error("Payment polling timeout");
	},
};
