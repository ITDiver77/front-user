import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	Checkbox,
	Slider,
	Tooltip,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useLanguage } from "../../i18n/LanguageContext";
import { paymentService } from "../../services/paymentService";
import type { PriceBreakdown } from "../../services/paymentService";
import type { Connection } from "../../types/connection";
import { formatDate } from "../../utils/dateHelpers";
import { paymentInitiationSchema } from "../../utils/validation";

interface PaymentInitiationModalProps {
	open: boolean;
	onClose: () => void;
	connectionName: string;
	connections: Connection[];
	onSuccess: (paymentId: number) => void;
	isFromPayments?: boolean;
}

type PaymentInitiationFormData = z.infer<typeof paymentInitiationSchema>;

const PaymentInitiationModal = ({
	open,
	onClose,
	connectionName,
	connections,
	onSuccess,
	isFromPayments = false,
}: PaymentInitiationModalProps) => {
	const { t } = useLanguage();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [polling, setPolling] = useState(false);
	const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
	const [calculatingPrice, setCalculatingPrice] = useState(false);
	const [payForAll, setPayForAll] = useState(true);

	const {
		handleSubmit,
		watch,
		setValue,
		formState: { errors: _errors },
		reset,
	} = useForm<PaymentInitiationFormData>({
		resolver: zodResolver(paymentInitiationSchema),
		defaultValues: {
			months: 1,
		},
	});

	const months = watch("months");

	const activeConnections = connections.filter(
		(c) => !c.is_deleted && c.auto_renew,
	);

	const showPayForAllCheckbox = activeConnections.length > 1;

	const fetchPrice = useCallback(async (m: number, connName?: string) => {
		setCalculatingPrice(true);
		try {
			const result = await paymentService.calculatePrice(m, connName);
			setPriceBreakdown(result);
		} catch {
			setPriceBreakdown(null);
		} finally {
			setCalculatingPrice(false);
		}
	}, []);

	useEffect(() => {
		if (open && months) {
			fetchPrice(months, payForAll ? undefined : connectionName);
		}
	}, [open, months, payForAll, fetchPrice, connectionName]);

	const onSubmit = async (data: PaymentInitiationFormData) => {
		setLoading(true);
		setError("");
		try {
			const response = await paymentService.initiatePayment({
				connection_name: payForAll ? undefined : connectionName,
				months: data.months,
				payment_method: "card",
			});

			if (response.redirect_url) {
				window.location.href = response.redirect_url;
			} else {
				startPolling(response.payment_id);
			}
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : t("modals.paymentInitFailed");
			setError(message);
			setLoading(false);
		}
	};

	const startPolling = async (paymentId: number) => {
		setPolling(true);
		try {
			const _payment = await paymentService.pollPaymentStatus(paymentId);
			setPolling(false);
			onSuccess(paymentId);
			onClose();
		} catch (_err: unknown) {
			setPolling(false);
			setError(t("modals.paymentPollingFailed"));
		}
	};

	const handleClose = () => {
		reset();
		setError("");
		setPriceBreakdown(null);
		setPayForAll(true);
		onClose();
	};

	const handleMonthsChange = (_: Event, value: number | number[]) => {
		setValue("months", value as number);
	};

	const marks = [
		{ value: 1, label: "1" },
		{ value: 3, label: "3" },
		{ value: 6, label: "6" },
		{ value: 12, label: "12" },
	];

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t("modals.extendConnection")}</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<Box
					sx={{
						mt: 1,
						p: 2,
						backgroundColor: "primary.main",
						borderRadius: 2,
						color: "primary.contrastText",
					}}
				>
					{calculatingPrice ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
							<CircularProgress size={24} sx={{ color: "common.white" }} />
						</Box>
					) : priceBreakdown ? (
						<>
							{priceBreakdown.target_date && (
								<Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
									{t("modals.paidUntil")}: {formatDate(priceBreakdown.target_date)}
								</Typography>
							)}
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								{t("modals.totalAmount")}:
							</Typography>
							<Typography variant="h4" fontWeight="bold">
								{priceBreakdown.total} ₽
							</Typography>
							{priceBreakdown.bulk_label && (
								<Typography variant="body2" sx={{ mt: 0.5, color: "success.main", fontWeight: 600 }}>
									{priceBreakdown.bulk_label === "2 months free" && t("modals.bulkLabel_2MonthsFree")}
									{priceBreakdown.bulk_label === "10% off" && t("modals.bulkLabel_6MonthsOff")}
									{priceBreakdown.bulk_label.endsWith("%") && t("modals.discountApplied", { percent: priceBreakdown.bulk_label })}
									{!priceBreakdown.bulk_label.includes("%") && !priceBreakdown.bulk_label.includes("months free") && priceBreakdown.bulk_label}
								</Typography>
							)}
							<Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />
							{priceBreakdown.breakdown.map((item) => {
								const fullPrice = item.months_to_charge * item.price;
								return (
								<Box key={item.connection_name} sx={{ mb: 1 }}>
									<Typography variant="body2" sx={{ opacity: 0.9 }}>
										{item.connection_name}: {item.months_to_charge} × {item.price} ₽ = {fullPrice} ₽
									</Typography>
									{item.bulk_savings > 0 && (
										<Typography variant="body2" sx={{ color: "#a5d6a7", pl: 2 }}>
											−{item.bulk_savings} ₽ ({item.bulk_label === "2 months free" ? t("modals.bulkLabel_2MonthsFree") : item.bulk_label === "10% off" ? t("modals.bulkLabel_6MonthsOff") : item.bulk_label.endsWith("%") ? t("modals.discountApplied", { percent: item.bulk_label }) : item.bulk_label})
										</Typography>
									)}
									{item.alignment > 0 && (
										<Typography variant="body2" sx={{ color: "#a5d6a7", pl: 2 }}>
											−{item.alignment} ₽ ({t("modals.alignmentAdjustment")})
										</Typography>
									)}
									<Typography variant="body2" fontWeight="bold" sx={{ opacity: 0.9 }}>
										= {item.charge} ₽
									</Typography>
								</Box>
							)})}
							{priceBreakdown.total === 0 && (
								<Typography variant="body2" sx={{ mt: 1 }}>
									{t("modals.allConnectionsPaidAhead") || "All connections are already paid ahead"}
								</Typography>
							)}
						</>
					) : (
						<Typography variant="body2" sx={{ opacity: 0.9 }}>
							{t("modals.priceCalculationFailed") || "Could not calculate price"}
						</Typography>
					)}
				</Box>
				<form id="payment-initiation-form" onSubmit={handleSubmit(onSubmit)}>
					<Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
						{t("modals.selectDuration")}
					</Typography>
					<Box sx={{ px: 1 }}>
						<Slider
							value={months}
							onChange={handleMonthsChange}
							min={1}
							max={12}
							step={1}
							marks={marks}
							valueLabelDisplay="on"
							valueLabelFormat={(v) =>
								`${v} ${v === 1 ? t("modals.month") : t("modals.months")}`
							}
							sx={{ mb: 3 }}
						/>
					</Box>
				</form>
				{showPayForAllCheckbox && (
					<Tooltip
						title={
							<Box sx={{ whiteSpace: "pre-line" }}>
								{activeConnections.map((c) => c.connection_name).join("\n")}
							</Box>
						}
						placement="right"
					>
						<FormControlLabel
							control={
								<Checkbox
									checked={payForAll}
									onChange={(e) => setPayForAll(e.target.checked)}
									size="small"
								/>
							}
							label={
								<Typography variant="body2" color="text.secondary">
									{payForAll
										? t("modals.payForAllConnections", { count: activeConnections.length })
										: t("modals.payForSingleConnection")}
								</Typography>
							}
							sx={{ mt: 1 }}
						/>
					</Tooltip>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={loading || polling}>
					{t("common.cancel")}
				</Button>
				<Button
					type="submit"
					form="payment-initiation-form"
					variant="contained"
					disabled={loading || polling || calculatingPrice || (priceBreakdown !== null && priceBreakdown.total === 0)}
				>
					{loading || polling ? (
						<CircularProgress size={24} />
					) : (
						t("modals.proceedToPayment")
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PaymentInitiationModal;
