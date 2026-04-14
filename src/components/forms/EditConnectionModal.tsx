import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Slider,
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n";
import { connectionService } from "../../services/connectionService";
import type { Connection } from "../../types/connection";

interface EditConnectionModalProps {
	open: boolean;
	onClose: () => void;
	connection: Connection;
	onSave: (maxConnections: number, newPrice: number) => Promise<void>;
}

interface SlotPreview {
	current_price: number;
	new_price: number;
	current_paydate: string | null;
	new_paydate: string | null;
	days_remaining: number | null;
	new_days_remaining: number | null;
}

const getConnectionWord = (count: number, t: (key: string) => string): string => {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) {
		return t("modals.connection");
	}
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
		return t("modals.connections");
	}
	return t("modals.connections");
};

const calculateConnectionPrice = (
	maxConnections: number,
	basePrice: number,
): number => {
	const paidSlots = Math.min(maxConnections - 1, 3);
	return basePrice + paidSlots * 100;
};

const getPriceBreakdown = (
	maxConnections: number,
	basePrice: number,
	t: (key: string) => string,
): string => {
	const paidSlots = Math.min(maxConnections - 1, 3);
	const total = calculateConnectionPrice(maxConnections, basePrice);
	if (maxConnections >= 5) return `${basePrice}+100+100+100+0 = ${total}₽`;
	let breakdown = `${basePrice}`;
	for (let i = 0; i < paidSlots; i++) {
		breakdown += "+100";
	}
	return `${breakdown} = ${total}₽`;
};

const formatDate = (dateStr: string | null): string => {
	if (!dateStr) return "—";
	const d = new Date(dateStr);
	return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
};

const EditConnectionModal = ({
	open,
	onClose,
	connection,
	onSave,
}: EditConnectionModalProps) => {
	const { t } = useLanguage();
	const [maxConnections, setMaxConnections] = useState(
		connection.max_connections || 1,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [preview, setPreview] = useState<SlotPreview | null>(null);
	const [previewLoading, setPreviewLoading] = useState(false);

	const currentSlots = connection.max_connections || 1;
	const basePrice = (connection.price || 150) - Math.min(currentSlots - 1, 3) * 100;

	useEffect(() => {
		if (open) {
			setMaxConnections(connection.max_connections || 1);
			setError("");
			setPreview(null);
		}
	}, [open, connection.max_connections]);

	useEffect(() => {
		if (!open) return;
		if (maxConnections === (connection.max_connections || 1)) {
			setPreview(null);
			return;
		}
		const timer = setTimeout(async () => {
			setPreviewLoading(true);
			try {
				const result = await connectionService.previewSlotChange(
					connection.connection_name,
					maxConnections,
				);
				setPreview(result);
			} catch {
				setPreview(null);
			} finally {
				setPreviewLoading(false);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [maxConnections, open, connection.connection_name, connection.max_connections]);

	const handleSave = async () => {
		setLoading(true);
		setError("");
		try {
			const newPrice = calculateConnectionPrice(maxConnections, basePrice);
			await onSave(maxConnections, newPrice);
			onClose();
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : t("common.error");
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	const marks = [
		{ value: 1, label: "1" },
		{ value: 2, label: "2" },
		{ value: 3, label: "3" },
		{ value: 4, label: "4" },
		{ value: 5, label: "5" },
	];

	const isUnchanged = maxConnections === (connection.max_connections || 1);
	const displayPrice = preview ? preview.new_price : calculateConnectionPrice(maxConnections, basePrice);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t("connectionCard.editConnection")}</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Typography variant="body1" sx={{ mb: 2 }}>
					{connection.connection_name}
				</Typography>

				<Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
					{maxConnections} {getConnectionWord(maxConnections, t)}
				</Typography>

				<Slider
					value={maxConnections}
					onChange={(_, value) => {
						if (typeof value === "number") {
							setMaxConnections(value);
						}
					}}
					min={1}
					max={5}
					step={1}
					marks={marks}
					valueLabelDisplay="auto"
					valueLabelFormat={(v) => v}
					sx={{ mb: 2 }}
				/>

				<Typography variant="body1" sx={{ mb: 1, textAlign: "center" }}>
					{t("connectionCard.price")}:{" "}
					<strong>
						{displayPrice} ₽/{t("modals.month")}
					</strong>
				</Typography>

				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ textAlign: "center", mb: 2 }}
				>
					{getPriceBreakdown(maxConnections, basePrice, t)}
				</Typography>

				{preview && !isUnchanged && (
					<Box sx={{
						mt: 2,
						p: 2,
						borderRadius: 1,
						bgcolor: "action.hover",
					}}>
						<Typography variant="subtitle2" gutterBottom>
							{t("connectionCard.slotChangePreview")}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{t("connectionCard.currentPaydate")}: {formatDate(preview.current_paydate)}
						</Typography>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>
							{t("connectionCard.newPaydate")}: {formatDate(preview.new_paydate)}
						</Typography>
						{preview.days_remaining !== null && preview.new_days_remaining !== null && (
							<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
								{t("connectionCard.daysChange", {
									old: Math.round(preview.days_remaining),
									new: Math.round(preview.new_days_remaining),
								})}
							</Typography>
						)}
					</Box>
				)}

				{previewLoading && !preview && !isUnchanged && (
					<Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
						<CircularProgress size={20} />
					</Box>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					{t("common.cancel")}
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					disabled={loading || isUnchanged}
				>
					{loading ? <CircularProgress size={24} /> : t("common.save")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditConnectionModal;
