import type { AxiosError } from "axios";
import type {
	Payment,
	PaymentInitiationRequest,
	PaymentInitiationResponse,
	PaymentListResponse,
} from "../types/payment";
import api from "./api";

export interface PriceBreakdown {
	total: number;
	months: number;
	breakdown: Array<{
		connection_name: string;
		price: number;
		paydate: string | null;
		months_to_charge: number;
		rounded_monthly_price: number;
		charge: number;
		bulk_savings: number;
		alignment: number;
		bulk_discount: number;
		bulk_label: string;
	}>;
	bulk_label: string;
}

export const paymentService = {
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

	calculatePrice: async (months: number): Promise<PriceBreakdown> => {
		try {
			const response = await api.post<PriceBreakdown>(
				"/payments/calculate-price",
				{ months },
			);
			return response.data;
		} catch (error) {
			console.error("Failed to calculate price", error);
			throw new Error(
				`Failed to calculate price: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},

	getPaymentStatus: async (paymentId: number) => {
		try {
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
