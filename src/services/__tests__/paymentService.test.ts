import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
	ApiError: class ApiError extends Error {
		status?: number;
		data?: unknown;
		constructor(status: number | undefined, message: string, data?: unknown) {
			super(message);
			this.name = "ApiError";
			this.status = status;
			this.data = data;
		}
	},
}));

import api from "../api";
import { paymentService } from "../paymentService";

const mockApi = api as any;

const mockPayments = [
	{
		id: 1,
		user_id: 1,
		amount: 1000,
		payment_date: "2026-01-15T10:30:00Z",
		period_days: 30,
		payment_method: "card",
		notes: null,
		status: "COMPLETED",
	},
	{
		id: 2,
		user_id: 1,
		amount: 1500,
		payment_date: "2026-02-10T14:20:00Z",
		period_days: 30,
		payment_method: "card",
		notes: "Renewal",
		status: "COMPLETED",
	},
];

describe("paymentService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getMyPayments", () => {
		it("should fetch payments with default pagination", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					payments: mockPayments,
					total: 2,
					total_amount: 2500,
					limit: 100,
					offset: 0,
				},
			});
			const response = await paymentService.getMyPayments();

			expect(response.payments).toHaveLength(2);
			expect(response.total).toBe(2);
			expect(response.total_amount).toBe(2500);
			expect(response.limit).toBe(100);
			expect(response.offset).toBe(0);
			expect(mockApi.get).toHaveBeenCalledWith("/payments/", {
				params: { limit: 100, offset: 0 },
			});
		});

		it("should fetch payments with custom pagination", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					payments: [],
					total: 2,
					total_amount: 2500,
					limit: 10,
					offset: 5,
				},
			});
			const response = await paymentService.getMyPayments(10, 5);

			expect(response.limit).toBe(10);
			expect(response.offset).toBe(5);
			expect(mockApi.get).toHaveBeenCalledWith("/payments/", {
				params: { limit: 10, offset: 5 },
			});
		});

		it("should include payment details", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					payments: mockPayments,
					total: 2,
					total_amount: 2500,
					limit: 100,
					offset: 0,
				},
			});
			const response = await paymentService.getMyPayments();

			expect(response.payments[0].id).toBe(1);
			expect(response.payments[0].amount).toBe(1000);
			expect(response.payments[0].status).toBe("COMPLETED");
			expect(response.payments[0].payment_method).toBe("card");
		});
	});

	describe("initiatePayment", () => {
		it("should initiate payment with all fields", async () => {
			mockApi.post.mockResolvedValue({
				data: {
					payment_id: 123,
					redirect_url: "https://payment-gateway.example.com/pay?id=123",
				},
			});
			const response = await paymentService.initiatePayment({
				connection_name: "testuser-1",
				server_name: "US-West",
				months: 3,
				payment_method: "card",
			});

			expect(response.payment_id).toBe(123);
			expect(response.redirect_url).toContain("payment-gateway");
			expect(mockApi.post).toHaveBeenCalledWith("/payments/initiate", {
				connection_name: "testuser-1",
				server_name: "US-West",
				months: 3,
				payment_method: "card",
			});
		});

		it("should initiate payment with optional fields omitted", async () => {
			mockApi.post.mockResolvedValue({
				data: {
					payment_id: 123,
					redirect_url: "https://payment-gateway.example.com/pay?id=123",
				},
			});
			const response = await paymentService.initiatePayment({
				months: 1,
			});

			expect(response.payment_id).toBe(123);
			expect(mockApi.post).toHaveBeenCalledWith("/payments/initiate", {
				months: 1,
			});
		});
	});

	describe("getPaymentStatus", () => {
		it("should fetch payment status by ID", async () => {
			mockApi.get.mockResolvedValue({ data: mockPayments[0] });
			const payment = await paymentService.getPaymentStatus(1);

			expect(payment.id).toBe(1);
			expect(payment.status).toBe("COMPLETED");
			expect(payment.amount).toBe(1000);
			expect(mockApi.get).toHaveBeenCalledWith(
				"/payments/transaction/1/status",
			);
		});

		it("should throw error for non-existent payment", async () => {
			const error: any = new Error("Not found");
			error.response = { status: 404, data: { detail: "Not found" } };
			mockApi.get.mockRejectedValue(error);

			await expect(paymentService.getPaymentStatus(999)).rejects.toThrow(
				"Payment not found",
			);
		});
	});

	describe("pollPaymentStatus", () => {
		it("should poll and return completed payment", async () => {
			vi.useFakeTimers();

			mockApi.get.mockResolvedValue({ data: mockPayments[0] });
			const pollPromise = paymentService.pollPaymentStatus(1, 10, 10);

			vi.advanceTimersByTime(50);

			const payment = await pollPromise;

			expect(payment.status).toBe("COMPLETED");
			vi.useRealTimers();
		});
	});
});
