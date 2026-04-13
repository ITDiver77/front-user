import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Radio,
	RadioGroup,
	FormControlLabel,
	Tooltip,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { paymentService } from "../../services/paymentService";
import type { PriceBreakdown } from "../../services/paymentService";
import { connectionService } from "../../services/connectionService";
import type { Connection } from "../../types/connection";

interface MakePaymentModalProps {
	open: boolean;
	onClose: () => void;
	onProceed: (months: number) => void;
	isFromPayments?: boolean;
}

const MakePaymentModal = ({
	open,
	onClose,
	onProceed,
	isFromPayments = false,
}: MakePaymentModalProps) => {
	const { t } = useLanguage();
	const [selectedMonths, setSelectedMonths] = useState<number>(1);
	const [activeConnections, setActiveConnections] = useState<Connection[]>([]);
	const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
	const [calculatingPrice, setCalculatingPrice] = useState(false);

	const fetchConnections = useCallback(async () => {
		try {
			const connections = await connectionService.getMyConnections();
			const active = connections.filter((c) => !c.is_deleted && c.auto_renew);
			setActiveConnections(active);
		} catch (err) {
			console.error("Failed to fetch connections", err);
			setActiveConnections([]);
		}
	}, []);

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
		if (open) {
			fetchConnections();
		}
	}, [open, fetchConnections]);

	useEffect(() => {
		if (open && selectedMonths) {
			fetchPrice(selectedMonths);
		}
	}, [open, selectedMonths, fetchPrice]);

	const handleProceed = () => {
		onProceed(selectedMonths);
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t("modals.makePayment")}</DialogTitle>
			<DialogContent>
				<Tooltip
					title={
						<Box sx={{ whiteSpace: "pre-line" }}>
							{activeConnections.map((c) => c.connection_name).join("\n")}
						</Box>
					}
					placement="right"
				>
					<Typography variant="body2" sx={{ mb: 2, color: "text.secondary", cursor: "pointer" }}>
						{t("modals.payForAllConnections", {
							count: activeConnections.length,
						})}
					</Typography>
				</Tooltip>

				<Divider sx={{ my: 2 }} />

				<Typography variant="subtitle1" sx={{ mb: 2 }}>
					{t("modals.selectPaymentDuration")}
				</Typography>

				<RadioGroup
					value={selectedMonths}
					onChange={(_, value) => setSelectedMonths(Number(value))}
				>
					<FormControlLabel
						value={1}
						control={<Radio />}
						label={`1 ${t("modals.monthsOption")}`}
					/>
					<FormControlLabel
						value={2}
						control={<Radio />}
						label={`2 ${t("modals.monthsOption")}`}
					/>
					<FormControlLabel
						value={3}
						control={<Radio />}
						label={`3 ${t("modals.monthsOption")}`}
					/>
					<FormControlLabel
						value={6}
						control={<Radio />}
						label={`6 ${t("modals.monthsOption")}`}
					/>
					<FormControlLabel
						value={12}
						control={<Radio />}
						label={`12 ${t("modals.monthsOption")}`}
					/>
				</RadioGroup>

				<Divider sx={{ my: 2 }} />

				{calculatingPrice ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
						<CircularProgress size={24} />
					</Box>
				) : priceBreakdown ? (
					<>
						{priceBreakdown.breakdown.length > 0 && (
							<Box sx={{ mb: 2 }}>
								{priceBreakdown.breakdown.map((item) => (
									<Typography key={item.connection_name} variant="body2" sx={{ mb: 0.5 }}>
										{item.connection_name}: {item.months_to_charge} × {item.rounded_monthly_price} ₽ = {item.charge} ₽
										{item.months_paid_ahead > 0 && (
											<Box component="span" sx={{ ml: 1, fontStyle: "italic", color: "text.secondary" }}>
												({item.months_paid_ahead} {t("modals.monthsPaidAhead") || "months already paid"})
											</Box>
										)}
									</Typography>
								))}
							</Box>
						)}
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography variant="subtitle1">{t("modals.total")}:</Typography>
							<Typography variant="h6" color="primary">
								{priceBreakdown.total.toFixed(2)} ₽
							</Typography>
						</Box>
						{priceBreakdown.total === 0 && (
							<Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
								{t("modals.allConnectionsPaidAhead") || "All connections are already paid ahead"}
							</Typography>
						)}
					</>
				) : (
					<Typography variant="body2" color="text.secondary">
						{t("modals.priceCalculationFailed") || "Could not calculate price"}
					</Typography>
				)}
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Button onClick={onClose} color="inherit">
					{t("common.cancel")}
				</Button>
				<Button
					onClick={handleProceed}
					variant="contained"
					color="primary"
					disabled={calculatingPrice || (priceBreakdown !== null && priceBreakdown.total === 0)}
				>
					{t("modals.proceedToPayment")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default MakePaymentModal;
