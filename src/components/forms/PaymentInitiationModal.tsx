import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Slider,
	Tooltip,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useLanguage } from "../../i18n/LanguageContext";
import { paymentService } from "../../services/paymentService";
import type { Connection } from "../../types/connection";
import { paymentInitiationSchema } from "../../utils/validation";

interface PaymentInitiationModalProps {
	open: boolean;
	onClose: () => void;
	connectionName: string;
	currentPrice: number;
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

const getDiscount = (months: number): number => {
	if (months >= 12) return 0.2;
	if (months >= 6) return 0.1;
	return 0;
};

const getDiscountLabel = (discount: number): string => {
	if (discount === 0.2) return "-20%";
	if (discount === 0.1) return "-10%";
	return "";
};

const calculateConnectionPrice = (
	maxConnections: number,
	isFirstConnection: boolean,
): number => {
	if (isFirstConnection) {
		// First: 150 + (n-1)*100 for n<5, else 450
		if (maxConnections >= 5) return 450;
		return 150 + (maxConnections - 1) * 100;
	} else {
		// Not first: n*100 for n<5, else 400
		if (maxConnections >= 5) return 400;
		return maxConnections * 100;
	}
};

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
			paymentMethod: "card",
		},
	});

	const months = watch("months");
	const paymentMethod = watch("paymentMethod");

	const activeConnections = connections.filter(
		(c) => !c.is_deleted && c.auto_renew,
	);
	// Sort by index to determine first connection
	const sortedActive = [...activeConnections].sort((a, b) => a.index - b.index);
	const firstConnectionName = sortedActive[0]?.connection_name;

	const totalPriceAll = activeConnections.reduce(
		(sum, c) => sum + (c.price || 0),
		0,
	);

	// Find the connection being paid for (when not payForAll)
	const currentConnection = connections.find(
		(c) => c.connection_name === connectionName,
	);
	const basePrice = payForAll
		? totalPriceAll
		: currentConnection?.price || 0;
	const discount = getDiscount(months);
	const totalAmount = basePrice * months * (1 - discount);

	const paymentDescription = payForAll
		? t("modals.payForAllConnections", { count: activeConnections.length })
		: t("modals.payForConnection", { name: connectionName });

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
				<Tooltip
					title={
						<Box sx={{ whiteSpace: "pre-line" }}>
							{activeConnections.map((c) => c.connection_name).join("\n")}
						</Box>
					}
					placement="right"
				>
					<span>
						<FormControlLabel
							control={
								<Checkbox
									checked={payForAll}
									onChange={(e) => setPayForAll(e.target.checked)}
									disabled={isFromPayments}
								/>
							}
							label={t("modals.payForAllConnectionsLabel")}
							sx={{ mb: 1, cursor: "pointer" }}
						/>
					</span>
				</Tooltip>
				<Tooltip
					title={
						<Box sx={{ whiteSpace: "pre-line" }}>
							{activeConnections.map((c) => c.connection_name).join("\n")}
						</Box>
					}
					placement="right"
				>
					<Typography variant="body2" sx={{ mb: 2, cursor: "pointer" }}>
						{paymentDescription}
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
					{discount > 0 && (
						<Alert severity="success" sx={{ mb: 2 }}>
							{t("modals.discountApplied", {
								percent: getDiscountLabel(discount),
							})}
						</Alert>
					)}
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
						<Typography variant="body2" sx={{ opacity: 0.9 }}>
							{t("modals.totalAmount")}:
						</Typography>
						<Typography variant="h4" fontWeight="bold">
							{totalAmount.toFixed(2)} ₽
						</Typography>
						<Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />
						<Typography variant="body2" sx={{ opacity: 0.9 }}>
							{payForAll ? (
								activeConnections.map((c) => (
									<Box key={c.connection_name} component="span">
										{c.connection_name}: {months} × {c.price || 0}₽ ={" "}
										{(c.price || 0) * months}₽
									</Box>
								))
							) : (
								<>
									{months}{" "}
									{months !== 1 ? t("modals.months") : t("modals.month")} ×{" "}
									{basePrice} ₽/{t("modals.month")}
								</>
							)}
							{discount > 0 && (
								<Box
									component="span"
									sx={{ ml: 1, fontWeight: "bold", color: "success.main" }}
								>
									({getDiscountLabel(discount)})
								</Box>
							)}
						</Typography>
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
					disabled={loading || polling}
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
