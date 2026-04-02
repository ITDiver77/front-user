import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	Radio,
	RadioGroup,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { connectionService } from "../../services/connectionService";

interface MakePaymentModalProps {
	open: boolean;
	onClose: () => void;
	onProceed: (months: number, amount: number) => void;
}

const DISCOUNTS: Record<number, number> = { 1: 0, 2: 0, 3: 0, 6: 0.1, 12: 0.2 };

const getPrice = (months: number, monthlyTotal: number) => {
	const base = monthlyTotal * months;
	const discount = DISCOUNTS[months] || 0;
	return base * (1 - discount);
};

const MakePaymentModal = ({
	open,
	onClose,
	onProceed,
}: MakePaymentModalProps) => {
	const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
	const [selectedMonths, setSelectedMonths] = useState<number>(1);
	const [_loading, setLoading] = useState(false);

	const fetchMonthlyTotal = useCallback(async () => {
		setLoading(true);
		try {
			const connections = await connectionService.getMyConnections();
			const total = connections
				.filter((c) => c.is_active)
				.reduce((sum, c) => sum + c.price, 0);
			setMonthlyTotal(total);
		} catch (err) {
			console.error("Failed to fetch connections", err);
			setMonthlyTotal(0);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (open) {
			fetchMonthlyTotal();
		}
	}, [open, fetchMonthlyTotal]);

	const handleProceed = () => {
		const amount = getPrice(selectedMonths, monthlyTotal);
		onProceed(selectedMonths, amount);
	};

	const _renderOption = (months: number) => {
		const basePrice = monthlyTotal * months;
		const discount = DISCOUNTS[months];
		const finalPrice = getPrice(months, monthlyTotal);
		const discountLabel =
			discount > 0 ? ` (-${discount * 100}% = $${finalPrice.toFixed(2)})` : "";
		return `○ ${months} month${months > 1 ? "s" : ""} — $${basePrice.toFixed(2)}${discountLabel}`;
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Make a Payment</DialogTitle>
			<DialogContent>
				<Box sx={{ mb: 3, mt: 1 }}>
					<Typography variant="body1">
						Your monthly total: <strong>${monthlyTotal.toFixed(2)}</strong>
					</Typography>
				</Box>

				<Divider sx={{ my: 2 }} />

				<Typography variant="subtitle1" sx={{ mb: 2 }}>
					Select payment duration:
				</Typography>

				<RadioGroup
					value={selectedMonths}
					onChange={(_, value) => setSelectedMonths(Number(value))}
				>
					<FormControlLabel
						value={1}
						control={<Radio />}
						label={`1 month — $${monthlyTotal.toFixed(2)}`}
					/>
					<FormControlLabel
						value={2}
						control={<Radio />}
						label={`2 months — $${(monthlyTotal * 2).toFixed(2)}`}
					/>
					<FormControlLabel
						value={3}
						control={<Radio />}
						label={`3 months — $${(monthlyTotal * 3).toFixed(2)}`}
					/>
					<FormControlLabel
						value={6}
						control={<Radio />}
						label={
							<>
								6 months — ${(monthlyTotal * 6).toFixed(2)} (-10% = $
								{getPrice(6, monthlyTotal).toFixed(2)})
							</>
						}
					/>
					<FormControlLabel
						value={12}
						control={<Radio />}
						label={
							<>
								12 months — ${(monthlyTotal * 12).toFixed(2)} (-20% = $
								{getPrice(12, monthlyTotal).toFixed(2)})
							</>
						}
					/>
				</RadioGroup>

				<Divider sx={{ my: 2 }} />

				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="subtitle1">Total:</Typography>
					<Typography variant="h6" color="primary">
						${getPrice(selectedMonths, monthlyTotal).toFixed(2)}
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button onClick={handleProceed} variant="contained" color="primary">
					Proceed to Payment
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default MakePaymentModal;
