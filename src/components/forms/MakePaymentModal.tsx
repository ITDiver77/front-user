import {
	Box,
	Button,
	Chip,
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
	const [previewDiscounts, setPreviewDiscounts] = useState<Record<number, number>>({});

	const fetchConnections = useCallback(async () => {
		try {
			const connections = await connectionService.getMyConnections();
			const active = connections.filter((c) => !c.is_deleted && c.auto_renew);
			setActiveConnections(active);
			if (active.length > 0) {
				const [r6, r12] = await Promise.all([
					paymentService.calculatePrice(6).catch(() => null),
					paymentService.calculatePrice(12).catch(() => null),
				]);
				const discounts: Record<number, number> = {};
				if (r6 && r6.breakdown.length > 0) discounts[6] = r6.breakdown[0].bulk_discount;
				if (r12 && r12.breakdown.length > 0) discounts[12] = r12.breakdown[0].bulk_discount;
				setPreviewDiscounts(discounts);
			}
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
						label={
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<span>6 {t("modals.monthsOption")}</span>
								{previewDiscounts[6] > 0 && (
									<Chip label={t("modals.bulkDiscountBadge", { percent: Math.round(previewDiscounts[6] * 100) })} size="small" color="success" />
								)}
							</Box>
						}
					/>
					<FormControlLabel
						value={12}
						control={<Radio />}
						label={
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<span>12 {t("modals.monthsOption")}</span>
								{previewDiscounts[12] > 0 && (
									<Chip label={t("modals.bulkDiscountBadge", { percent: Math.round(previewDiscounts[12] * 100) })} size="small" color="success" />
								)}
							</Box>
						}
					/>
				</RadioGroup>

				<Divider sx={{ my: 2 }} />

				{calculatingPrice ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
						<CircularProgress size={24} />
					</Box>
				) : priceBreakdown ? (
					<>
						{priceBreakdown.bulk_label && (
								<Typography variant="body2" sx={{ mb: 1, color: "success.main", fontWeight: 600 }}>
									{priceBreakdown.bulk_label === "2 months free" && t("modals.bulkLabel_2MonthsFree")}
									{priceBreakdown.bulk_label === "10% off" && t("modals.bulkLabel_6MonthsOff")}
									{priceBreakdown.bulk_label.endsWith("%") && t("modals.discountApplied", { percent: priceBreakdown.bulk_label })}
									{!priceBreakdown.bulk_label.includes("%") && !priceBreakdown.bulk_label.includes("months free") && priceBreakdown.bulk_label}
								</Typography>
							)}
							<Box sx={{ mb: 2 }}>
								{priceBreakdown.breakdown.map((item) => {
									const fullPrice = item.months_to_charge * item.price;
									return (
									<Box key={item.connection_name} sx={{ mb: 1 }}>
										<Typography variant="body2">
											{item.connection_name}: {item.months_to_charge} × {item.price} ₽ = {fullPrice} ₽
										</Typography>
										{item.bulk_savings > 0 && (
											<Typography variant="body2" sx={{ color: "success.main", pl: 2 }}>
												−{item.bulk_savings} ₽ ({item.bulk_label === "2 months free" ? t("modals.bulkLabel_2MonthsFree") : item.bulk_label === "10% off" ? t("modals.bulkLabel_6MonthsOff") : item.bulk_label.endsWith("%") ? t("modals.discountApplied", { percent: item.bulk_label }) : item.bulk_label})
											</Typography>
										)}
										{item.alignment > 0 && (
											<Typography variant="body2" sx={{ color: "success.main", pl: 2 }}>
												−{item.alignment} ₽ ({t("modals.alignmentAdjustment")})
											</Typography>
										)}
										<Typography variant="body2" fontWeight="bold">
											= {item.charge} ₽
										</Typography>
									</Box>
								)})}
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
