import PaymentHistoryIcon from "@mui/icons-material/Payment";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import MakePaymentModal from "../components/forms/MakePaymentModal";
import { paymentService } from "../services/paymentService";
import {
	pageVariants,
	staggerContainer,
	staggerItem,
} from "../styles/animations";
import type { Payment, PaymentStatus } from "../types/payment";
import { formatDate } from "../utils/dateHelpers";

interface DateRange {
	startDate: string;
	endDate: string;
}

type StatusFilter = "ALL" | PaymentStatus;

const getStatusColor = (status: PaymentStatus) => {
	switch (status) {
		case "COMPLETED":
			return "success";
		case "PENDING":
			return "warning";
		case "FAILED":
			return "error";
	}
};

const getStatusLabel = (status: PaymentStatus) => {
	switch (status) {
		case "COMPLETED":
			return "Completed";
		case "PENDING":
			return "Pending";
		case "FAILED":
			return "Failed";
	}
};

const PaymentHistory = () => {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");
	const [modalOpen, setModalOpen] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange>({
		startDate: "",
		endDate: "",
	});
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

	const fetchPayments = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const response = await paymentService.getMyPayments();
			setPayments(response.payments);
		} catch (err: any) {
			setError(err.message || "Failed to fetch payments");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPayments();
	}, [fetchPayments]);

	const handleProceedToPayment = async (months: number, _amount: number) => {
		try {
			const response = await paymentService.initiatePayment({
				months,
			});
			if (response.redirect_url) {
				window.location.href = response.redirect_url;
			}
			setModalOpen(false);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to initiate payment";
			alert(message);
		}
	};

	const filteredPayments = useMemo(() => {
		return payments.filter((payment) => {
			if (statusFilter !== "ALL" && payment.status !== statusFilter) {
				return false;
			}

			if (dateRange.startDate || dateRange.endDate) {
				const paymentDate = new Date(payment.payment_date);
				paymentDate.setHours(0, 0, 0, 0);

				if (dateRange.startDate) {
					const startDate = new Date(dateRange.startDate);
					startDate.setHours(0, 0, 0, 0);
					if (paymentDate < startDate) {
						return false;
					}
				}

				if (dateRange.endDate) {
					const endDate = new Date(dateRange.endDate);
					endDate.setHours(23, 59, 59, 999);
					if (paymentDate > endDate) {
						return false;
					}
				}
			}

			return true;
		});
	}, [payments, dateRange, statusFilter]);

	const summaryStats = useMemo(() => {
		const completed = filteredPayments.filter((p) => p.status === "COMPLETED");
		const pending = filteredPayments.filter((p) => p.status === "PENDING");
		const failed = filteredPayments.filter((p) => p.status === "FAILED");

		return {
			totalAmount: completed.reduce((sum, p) => sum + p.amount, 0),
			totalPayments: filteredPayments.length,
			pendingCount: pending.length,
			failedCount: failed.length,
		};
	}, [filteredPayments]);

	const hasActiveFilters =
		statusFilter !== "ALL" || dateRange.startDate || dateRange.endDate;

	const handleClearFilters = () => {
		setDateRange({ startDate: "", endDate: "" });
		setStatusFilter("ALL");
	};

	const handleDateChange = (field: "startDate" | "endDate", value: string) => {
		setDateRange((prev) => ({ ...prev, [field]: value }));
	};

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="60vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<motion.div variants={pageVariants} initial="initial" animate="animate">
			<Box>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						justifyContent: "space-between",
						alignItems: { xs: "stretch", sm: "center" },
						gap: { xs: 2, sm: 0 },
						mb: 3,
					}}
				>
					<Typography variant="h4" fontWeight={600}>
						Payment History
					</Typography>
					<Button
						variant="contained"
						color="primary"
						onClick={() => setModalOpen(true)}
						sx={{
							whiteSpace: "nowrap",
							minWidth: "auto",
							px: { xs: 2, sm: 3 },
						}}
					>
						Make a Payment
					</Button>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
				>
					<motion.div variants={staggerItem}>
						<Paper
							elevation={0}
							sx={{
								p: 2,
								mb: 3,
								borderRadius: 2,
								border: "1px solid",
								borderColor: "divider",
							}}
						>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ mb: 2 }}
							>
								Filter Payments
							</Typography>
							<Box
								sx={{
									display: "flex",
									flexWrap: "wrap",
									gap: 2,
									alignItems: "center",
								}}
							>
								<TextField
									type="date"
									label="Start Date"
									value={dateRange.startDate}
									onChange={(e) =>
										handleDateChange("startDate", e.target.value)
									}
									size="small"
									sx={{ minWidth: 150 }}
									InputLabelProps={{ shrink: true }}
								/>
								<TextField
									type="date"
									label="End Date"
									value={dateRange.endDate}
									onChange={(e) => handleDateChange("endDate", e.target.value)}
									size="small"
									sx={{ minWidth: 150 }}
									InputLabelProps={{ shrink: true }}
								/>
								<FormControl size="small" sx={{ minWidth: 150 }}>
									<InputLabel>Status</InputLabel>
									<Select
										value={statusFilter}
										label="Status"
										onChange={(e) =>
											setStatusFilter(e.target.value as StatusFilter)
										}
									>
										<MenuItem value="ALL">All</MenuItem>
										<MenuItem value="COMPLETED">Completed</MenuItem>
										<MenuItem value="PENDING">Pending</MenuItem>
										<MenuItem value="FAILED">Failed</MenuItem>
									</Select>
								</FormControl>
								{hasActiveFilters && (
									<Button
										variant="outlined"
										color="inherit"
										size="small"
										onClick={handleClearFilters}
									>
										Clear Filters
									</Button>
								)}
							</Box>
						</Paper>
					</motion.div>
				</motion.div>

				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
				>
					<motion.div variants={staggerItem}>
						<Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
							<Paper
								elevation={0}
								sx={{
									p: 2,
									minWidth: 150,
									flex: "1 1 auto",
									borderRadius: 2,
									border: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography variant="body2" color="text.secondary">
									Total Paid (Filtered)
								</Typography>
								<Typography variant="h5" fontWeight={600}>
									${summaryStats.totalAmount.toFixed(2)}
								</Typography>
							</Paper>
							<Paper
								elevation={0}
								sx={{
									p: 2,
									minWidth: 150,
									flex: "1 1 auto",
									borderRadius: 2,
									border: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography variant="body2" color="text.secondary">
									Total Payments
								</Typography>
								<Typography variant="h5" fontWeight={600}>
									{summaryStats.totalPayments}
								</Typography>
							</Paper>
							<Paper
								elevation={0}
								sx={{
									p: 2,
									minWidth: 150,
									flex: "1 1 auto",
									borderRadius: 2,
									border: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography variant="body2" color="text.secondary">
									Pending
								</Typography>
								<Typography variant="h5" fontWeight={600} color="warning.main">
									{summaryStats.pendingCount}
								</Typography>
							</Paper>
							<Paper
								elevation={0}
								sx={{
									p: 2,
									minWidth: 150,
									flex: "1 1 auto",
									borderRadius: 2,
									border: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography variant="body2" color="text.secondary">
									Failed
								</Typography>
								<Typography variant="h5" fontWeight={600} color="error.main">
									{summaryStats.failedCount}
								</Typography>
							</Paper>
						</Box>
					</motion.div>
				</motion.div>

				{filteredPayments.length === 0 ? (
					<Paper
						elevation={0}
						sx={{
							borderRadius: 2,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<EmptyState
							icon={<PaymentHistoryIcon />}
							title={
								hasActiveFilters ? "No matching payments" : "No payment history"
							}
							description={
								hasActiveFilters
									? "Try adjusting your filters to find payments"
									: "Make a payment to see your payment history here"
							}
							action={
								hasActiveFilters ? (
									<Button variant="outlined" onClick={handleClearFilters}>
										Clear Filters
									</Button>
								) : (
									<Button
										variant="contained"
										onClick={() => setModalOpen(true)}
									>
										Make a Payment
									</Button>
								)
							}
						/>
					</Paper>
				) : (
					<Paper
						elevation={0}
						sx={{
							borderRadius: 2,
							border: "1px solid",
							borderColor: "divider",
							overflow: "hidden",
						}}
					>
						<Box sx={{ overflowX: "auto" }}>
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr>
										<th
											style={{
												padding: "12px 16px",
												textAlign: "left",
												borderBottom: "1px solid",
												borderColor: "divider",
												backgroundColor: "transparent",
											}}
										>
											<Typography variant="subtitle2" color="text.secondary">
												Date
											</Typography>
										</th>
										<th
											style={{
												padding: "12px 16px",
												textAlign: "left",
												borderBottom: "1px solid",
												borderColor: "divider",
												backgroundColor: "transparent",
											}}
										>
											<Typography variant="subtitle2" color="text.secondary">
												Amount
											</Typography>
										</th>
										<th
											style={{
												padding: "12px 16px",
												textAlign: "left",
												borderBottom: "1px solid",
												borderColor: "divider",
												backgroundColor: "transparent",
											}}
										>
											<Typography variant="subtitle2" color="text.secondary">
												Period
											</Typography>
										</th>
										<th
											style={{
												padding: "12px 16px",
												textAlign: "left",
												borderBottom: "1px solid",
												borderColor: "divider",
												backgroundColor: "transparent",
											}}
										>
											<Typography variant="subtitle2" color="text.secondary">
												Description
											</Typography>
										</th>
										<th
											style={{
												padding: "12px 16px",
												textAlign: "left",
												borderBottom: "1px solid",
												borderColor: "divider",
												backgroundColor: "transparent",
											}}
										>
											<Typography variant="subtitle2" color="text.secondary">
												Status
											</Typography>
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredPayments.map((payment) => (
										<tr key={payment.id}>
											<td
												style={{
													padding: "12px 16px",
													borderBottom: "1px solid",
													borderColor: "divider",
												}}
											>
												<Typography variant="body2">
													{formatDate(payment.payment_date)}
												</Typography>
											</td>
											<td
												style={{
													padding: "12px 16px",
													borderBottom: "1px solid",
													borderColor: "divider",
												}}
											>
												<Typography variant="body2" fontWeight={600}>
													${payment.amount.toFixed(2)}
												</Typography>
											</td>
											<td
												style={{
													padding: "12px 16px",
													borderBottom: "1px solid",
													borderColor: "divider",
												}}
											>
												<Typography variant="body2">
													{payment.period_days} days
												</Typography>
											</td>
											<td
												style={{
													padding: "12px 16px",
													borderBottom: "1px solid",
													borderColor: "divider",
												}}
											>
												<Typography variant="body2" color="text.secondary">
													{payment.notes || payment.payment_method || "-"}
												</Typography>
											</td>
											<td
												style={{
													padding: "12px 16px",
													borderBottom: "1px solid",
													borderColor: "divider",
												}}
											>
												<Chip
													label={getStatusLabel(payment.status)}
													color={getStatusColor(payment.status)}
													size="small"
													sx={{ fontWeight: 500 }}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</Box>
					</Paper>
				)}
			</Box>

			<MakePaymentModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				onProceed={handleProceedToPayment}
			/>
		</motion.div>
	);
};

export default PaymentHistory;
