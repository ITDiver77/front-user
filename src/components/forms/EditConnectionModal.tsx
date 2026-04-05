import {
	Alert,
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
import type { Connection } from "../../types/connection";

interface EditConnectionModalProps {
	open: boolean;
	onClose: () => void;
	connection: Connection;
	isFirstConnection: boolean;
	onSave: (maxConnections: number, newPrice: number) => Promise<void>;
}

const getConnectionWord = (count: number): string => {
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) {
		return "подключение";
	}
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
		return "подключения";
	}
	return "подключений";
};

const calculateConnectionPrice = (
	maxConnections: number,
	isFirstConnection: boolean,
): number => {
	if (isFirstConnection) {
		// First connection: slot 1 = 150, slots 2-4 = 100, slot 5 = free
		if (maxConnections >= 5) return 450; // 150+100+100+100+0
		let price = 150;
		for (let i = 2; i <= maxConnections; i++) {
			price += 100;
		}
		return price;
	} else {
		// Not first: slot 1 = 100, slots 2-4 = 100, slot 5 = free
		if (maxConnections >= 5) return 400; // 100+100+100+100+0
		return maxConnections * 100;
	}
};

const getPriceBreakdown = (
	maxConnections: number,
	isFirstConnection: boolean,
): string => {
	if (isFirstConnection) {
		if (maxConnections >= 5) return "150+100+100+100+0 = 450₽";
		let breakdown = "150";
		for (let i = 2; i <= maxConnections; i++) {
			breakdown += `+100`;
		}
		return `${breakdown} = ${calculateConnectionPrice(maxConnections, true)}₽`;
	} else {
		if (maxConnections >= 5) return "100+100+100+100+0 = 400₽";
		let breakdown = "";
		for (let i = 1; i <= maxConnections; i++) {
			breakdown += `${i > 1 ? "+" : ""}100`;
		}
		return `${breakdown} = ${calculateConnectionPrice(maxConnections, false)}₽`;
	}
};

const EditConnectionModal = ({
	open,
	onClose,
	connection,
	isFirstConnection,
	onSave,
}: EditConnectionModalProps) => {
	const { t } = useLanguage();
	const [maxConnections, setMaxConnections] = useState(
		connection.max_connections || 1,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (open) {
			setMaxConnections(connection.max_connections || 1);
			setError("");
		}
	}, [open, connection.max_connections]);

	const handleSave = async () => {
		setLoading(true);
		setError("");
		try {
			const newPrice = calculateConnectionPrice(
				maxConnections,
				isFirstConnection,
			);
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
					{maxConnections} {getConnectionWord(maxConnections)}
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
						{calculateConnectionPrice(maxConnections, isFirstConnection)} ₽
					</strong>
				</Typography>

				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ textAlign: "center", mb: 2 }}
				>
					{getPriceBreakdown(maxConnections, isFirstConnection)}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					{t("common.cancel")}
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					disabled={
						loading || maxConnections === (connection.max_connections || 1)
					}
				>
					{loading ? <CircularProgress size={24} /> : t("common.save")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default EditConnectionModal;
