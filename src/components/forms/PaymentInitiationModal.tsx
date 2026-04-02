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
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
	Checkbox,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { paymentService } from "../../services/paymentService";
import { paymentInitiationSchema } from "../../utils/validation";
import type { Connection } from "../../types/connection";

interface PaymentInitiationModalProps {
	open: boolean;
	onClose: () => void;
	connectionName: string;
	currentPrice: number;
	connections: Connection[];
	onSuccess: (paymentId: number) => void;
}

type PaymentInitiationFormData = z.infer<typeof paymentInitiationSchema>;

const PAYMENT_METHODS = [
	{ value: "card", label: "Credit/Debit Card" },
	{ value: "paypal", label: "PayPal" },
	{ value: "crypto", label: "Cryptocurrency" },
];

const PaymentInitiationModal = ({
	open,
	onClose,
	connectionName,
	currentPrice,
	connections,
	onSuccess,
}: PaymentInitiationModalProps) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [polling, setPolling] = useState(false);
	const [payForAll, setPayForAll] = useState(true);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		reset,
	} = useForm<PaymentInitiationFormData>({
		resolver: zodResolver(paymentInitiationSchema),
		defaultValues: {
			months: 1,
			paymentMethod: "card",
		},
	});

	const months = watch("months");

	const activeConnections = connections.filter((c) => !c.is_deleted && c.auto_renew);
	const totalPriceAll = activeConnections.reduce((sum, c) => sum + c.price, 0);
	const totalAmount = payForAll ? totalPriceAll * months : currentPrice * months;

	const paymentDescription = payForAll
		? `Pay for all connections with auto-renew (${activeConnections.length})`
		: `Pay for connection "${connectionName}"`;

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
		} catch (err: any) {
			setError(err.message || "Failed to initiate payment");
			setLoading(false);
		}
	};

	const startPolling = async (paymentId: number) => {
		setPolling(true);
		try {
			const payment = await paymentService.pollPaymentStatus(paymentId);
			setPolling(false);
			onSuccess(paymentId);
			onClose();
		} catch (err: any) {
			setPolling(false);
			setError("Payment polling failed");
		}
	};

	const handleClose = () => {
		reset();
		setError("");
		setPayForAll(true);
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Extend Connection</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<FormControlLabel
					control={
						<Checkbox
							checked={payForAll}
							onChange={(e) => setPayForAll(e.target.checked)}
						/>
					}
					label="Pay for all connections"
					sx={{ mb: 2 }}
				/>
				<Typography variant="body2" sx={{ mb: 2 }}>
					{paymentDescription}
				</Typography>
				<form id="payment-initiation-form" onSubmit={handleSubmit(onSubmit)}>
					<TextField
						margin="normal"
						fullWidth
						label="Months to add"
						type="number"
						inputProps={{ min: 1, max: 36 }}
						{...register("months", { valueAsNumber: true })}
						error={!!errors.months}
						helperText={errors.months?.message}
					/>
					<FormControl fullWidth margin="normal">
						<InputLabel id="payment-method-label">Payment Method</InputLabel>
						<Select
							labelId="payment-method-label"
							label="Payment Method"
							{...register("paymentMethod")}
							defaultValue="card"
						>
							{PAYMENT_METHODS.map((method) => (
								<MenuItem key={method.value} value={method.value}>
									{method.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Box
						sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}
					>
						<Typography variant="body2" color="textSecondary">
							Total amount:
						</Typography>
						<Typography variant="h5">${totalAmount.toFixed(2)}</Typography>
						<Typography variant="caption" color="textSecondary">
							{payForAll ? (
								<>
									{months} month{months !== 1 ? "s" : ""} × $
									{totalPriceAll}/month ({activeConnections.length} connections)
								</>
							) : (
								<>
									{months} month{months !== 1 ? "s" : ""} × $
									{currentPrice}/month
								</>
							)}
						</Typography>
					</Box>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={loading || polling}>
					Cancel
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
						"Proceed to Payment"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default PaymentInitiationModal;
