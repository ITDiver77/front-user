import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { paymentService } from "../../services/paymentService";
import {
	getCapturedRequests,
	resetCapturedRequests,
	server,
} from "../../test/msw/handlers";

// Mock import.meta.env for axios
vi.stubGlobal("importMeta", {
	env: { VITE_API_BASE_URL: "http://localhost:8000/api/v1" },
});

describe("paymentService", () => {
	beforeAll(() => server.listen());
	afterAll(() => server.close());
	beforeEach(() => {
		resetCapturedRequests();
	});

	describe("getMyPayments", () => {
		it("should fetch payments with default pagination", async () => {
			const response = await paymentService.getMyPayments();

			expect(response.payments).toHaveLength(2);
			expect(response.total).toBe(2);
			expect(response.total_amount).toBe(2500);
			expect(response.limit).toBe(100);
			expect(response.offset).toBe(0);

			const requests = getCapturedRequests();
			expect(requests.getPayments).toEqual({ limit: 100, offset: 0 });
		});

		it("should fetch payments with custom pagination", async () => {
			const response = await paymentService.getMyPayments(10, 5);

			expect(response.limit).toBe(10);
			expect(response.offset).toBe(5);

			const requests = getCapturedRequests();
			expect(requests.getPayments).toEqual({ limit: 10, offset: 5 });
		});

		it("should include payment details", async () => {
			const response = await paymentService.getMyPayments();

			expect(response.payments[0].id).toBe(1);
			expect(response.payments[0].amount).toBe(1000);
			expect(response.payments[0].status).toBe("COMPLETED");
			expect(response.payments[0].payment_method).toBe("card");
		});
	});

	describe("initiatePayment", () => {
		it("should initiate payment with all fields", async () => {
			const response = await paymentService.initiatePayment({
				connection_name: "testuser-1",
				server_name: "US-West",
				months: 3,
				payment_method: "card",
			});

			expect(response.payment_id).toBe(123);
			expect(response.redirect_url).toContain("payment-gateway");

			const requests = getCapturedRequests();
			expect(requests.initiatePayment).toEqual({
				connection_name: "testuser-1",
				server_name: "US-West",
				months: 3,
				payment_method: "card",
			});
		});

		it("should initiate payment with optional fields omitted", async () => {
			const response = await paymentService.initiatePayment({
				months: 1,
			});

			expect(response.payment_id).toBe(123);

			const requests = getCapturedRequests();
			expect(requests.initiatePayment).toEqual({ months: 1 });
		});
	});

	describe("getPaymentStatus", () => {
		it("should fetch payment status by ID", async () => {
			const payment = await paymentService.getPaymentStatus(1);

			expect(payment.id).toBe(1);
			expect(payment.status).toBe("COMPLETED");
			expect(payment.amount).toBe(1000);

			const requests = getCapturedRequests();
			expect(requests.paymentStatus).toBe("1");
		});

		it("should throw error for non-existent payment", async () => {
			await expect(paymentService.getPaymentStatus(999)).rejects.toThrow(
				"Payment not found",
			);
		});
	});

	describe("pollPaymentStatus", () => {
		it("should poll and return completed payment", async () => {
			vi.useFakeTimers();

			const pollPromise = paymentService.pollPaymentStatus(1, 10, 10);

			// Fast-forward timers
			vi.advanceTimersByTime(50);

			const payment = await pollPromise;

			expect(payment.status).toBe("COMPLETED");
			vi.useRealTimers();
		});
	});
});
