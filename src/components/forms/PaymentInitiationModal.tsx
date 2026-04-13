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
	FormControl,
	InputLabel,
	MenuItem,
	Select,
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

const PAYMENT_METHODS = (t: (key: string) => string) => [
	{ value: "card", label: t("modals.creditDebitCard") },
	{ value: "paypal", label: t("modals.paypal") },
	{ value: "crypto", label: t("modals.cryptocurrency") },
];

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
			paymentMethod: "card",
		},
	});

	const months = watch("months");
	const paymentMethod = watch("paymentMethod");

	const activeConnections = connections.filter(
		(c) => !c.is_deleted && c.auto_renew,
	);

	const fetchPrice = useCallback(async (m: number) => {
		setCalculatingPrice(true);
		try {
			const result = await paymentService.calculatePrice(m);
			setPriceBreakdown(result);
		} catch {
			setPriceBreakdown(null);
		} finally {
			setCalculatingPrice(false);
		}
	}, []);

	useEffect(() => {
		if (open && months) {
			fetchPrice(months);
		}
	}, [open, months, fetchPrice]);

	const onSubmit = async (data: PaymentInitiationFormData) => {
		setLoading(true);
		setError("");
		try {
			const response = await paymentService.initiatePayment({
				connection_name: connectionName,
				months: data.months,
				payment_method: data.paymentMethod,
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
				<Tooltip
					title={
						<Box sx={{ whiteSpace: "pre-line" }}>
							{activeConnections.map((c) => c.connection_name).join("\n")}
						</Box>
					}
					placement="right"
				>
					<Typography variant="body2" sx={{ mb: 2, cursor: "pointer" }}>
						{t("modals.payForAllConnections", { count: activeConnections.length })}
					</Typography>
				</Tooltip>
				<form id="payment-initiation-form" onSubmit={handleSubmit(onSubmit)}>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>
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
					<FormControl fullWidth margin="normal">
						<InputLabel id="payment-method-label">
							{t("modals.paymentMethod")}
						</InputLabel>
						<Select
							labelId="payment-method-label"
							label={t("modals.paymentMethod")}
							value={paymentMethod}
							onChange={(e) => setValue("paymentMethod", e.target.value)}
						>
							{PAYMENT_METHODS(t).map((method) => (
								<MenuItem key={method.value} value={method.value}>
									{method.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Box
						sx={{
							mt: 2,
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
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									{t("modals.totalAmount")}:
								</Typography>
								<Typography variant="h4" fontWeight="bold">
									{priceBreakdown.total.toFixed(2)} ₽
								</Typography>
								{priceBreakdown.breakdown.length > 0 && priceBreakdown.breakdown[0].bulk_discount > 0 && (
									<Typography variant="body2" sx={{ mt: 0.5, color: "success.main", fontWeight: 600 }}>
										{t("modals.discountApplied", { percent: `${Math.round(priceBreakdown.breakdown[0].bulk_discount * 100)}%` })}
									</Typography>
								)}
								<Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />
								{priceBreakdown.breakdown.map((item) => (
									<Box key={item.connection_name} sx={{ mb: 0.5 }}>
										<Typography variant="body2" sx={{ opacity: 0.9 }}>
											{item.connection_name}: {item.months_to_charge} × {item.rounded_monthly_price} ₽ = {item.charge} ₽
											{item.months_paid_ahead > 0 && (
												<Box component="span" sx={{ ml: 1, fontStyle: "italic" }}>
													({item.months_paid_ahead} {t("modals.monthsPaidAhead") || "months already paid"})
												</Box>
											)}
										</Typography>
									</Box>
								))}
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
				</form>
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
