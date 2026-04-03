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
import { useLanguage } from "../i18n/LanguageContext";
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

const PaymentHistory = () => {
	const { t } = useLanguage();
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>("");
	const [modalOpen, setModalOpen] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange>({
		startDate: "",
		endDate: "",
	});
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

	const getStatusLabel = (status: PaymentStatus) => {
		switch (status) {
			case "COMPLETED":
				return t("paymentHistory.completed");
			case "PENDING":
				return t("paymentHistory.pending");
			case "FAILED":
				return t("paymentHistory.failed");
		}
	};

	const fetchPayments = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const response = await paymentService.getMyPayments();
			setPayments(response.payments);
		} catch (err: any) {
			setError(err.message || t("paymentHistory.fetchFailed"));
		} finally {
			setLoading(false);
		}
	}, [t]);

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
						{t("paymentHistory.title")}
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
						{t("paymentHistory.makePayment")}
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
								{t("paymentHistory.filterPayments")}
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
									label={t("paymentHistory.startDate")}
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
									label={t("paymentHistory.endDate")}
									value={dateRange.endDate}
									onChange={(e) => handleDateChange("endDate", e.target.value)}
									size="small"
									sx={{ minWidth: 150 }}
									InputLabelProps={{ shrink: true }}
								/>
								<FormControl size="small" sx={{ minWidth: 150 }}>
									<InputLabel>{t("paymentHistory.status")}</InputLabel>
									<Select
										value={statusFilter}
										label={t("paymentHistory.status")}
										onChange={(e) =>
											setStatusFilter(e.target.value as StatusFilter)
										}
									>
										<MenuItem value="ALL">{t("paymentHistory.all")}</MenuItem>
										<MenuItem value="COMPLETED">{t("paymentHistory.completed")}</MenuItem>
										<MenuItem value="PENDING">{t("paymentHistory.pending")}</MenuItem>
										<MenuItem value="FAILED">{t("paymentHistory.failed")}</MenuItem>
									</Select>
								</FormControl>
								{hasActiveFilters && (
									<Button
										variant="outlined"
										color="inherit"
										size="small"
										onClick={handleClearFilters}
									>
										{t("paymentHistory.clearFilters")}
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
									{t("paymentHistory.totalPaidFiltered")}
								</Typography>
								<Typography variant="h5" fontWeight={600}>
									{summaryStats.totalAmount.toFixed(2)} ₽
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
									{t("paymentHistory.totalPayments")}
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
									{t("paymentHistory.pending")}
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
									{t("paymentHistory.failed")}
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
								hasActiveFilters ? t("paymentHistory.noMatchingPayments") : t("paymentHistory.noPayments")
							}
							description={
								hasActiveFilters
									? t("paymentHistory.adjustFilters")
									: t("paymentHistory.noPaymentsDesc")
							}
							action={
								hasActiveFilters ? (
									<Button variant="outlined" onClick={handleClearFilters}>
										{t("paymentHistory.clearFilters")}
									</Button>
								) : (
									<Button
										variant="contained"
										onClick={() => setModalOpen(true)}
									>
										{t("paymentHistory.makePayment")}
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
												{t("paymentHistory.date")}
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
												{t("paymentHistory.amount")}
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
												{t("paymentHistory.period")}
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
												{t("paymentHistory.description")}
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
												{t("paymentHistory.status")}
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
													{payment.amount.toFixed(2)} ₽
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
													{payment.period_days} {t("paymentHistory.days")}
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
