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
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { paymentService } from "../../services/paymentService";
import { paymentInitiationSchema } from "../../utils/validation";

interface PaymentInitiationModalProps {
	open: boolean;
	onClose: () => void;
	connectionName: string;
	currentPrice: number;
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
	onSuccess,
}: PaymentInitiationModalProps) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [polling, setPolling] = useState(false);

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
	const totalAmount = currentPrice * months;

	const onSubmit = async (data: PaymentInitiationFormData) => {
		setLoading(true);
		setError("");
		try {
			const response = await paymentService.initiatePayment({
				connection_name: connectionName,
				months: data.months,
				payment_method: data.paymentMethod,
			});

			// If redirect URL provided, redirect to payment gateway
			if (response.redirect_url) {
				window.location.href = response.redirect_url;
			} else {
				// No redirect, start polling for payment completion
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
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Extend Connection: {connectionName}</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<Typography variant="body2" sx={{ mb: 2 }}>
					Current monthly price: <strong>${currentPrice}</strong>
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
							{months} month{months !== 1 ? "s" : ""} × ${currentPrice}/month
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
