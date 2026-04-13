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
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Slider,
	TextField,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useLanguage } from "../../i18n/LanguageContext";
import { paymentService } from "../../services/paymentService";
import { serverService } from "../../services/serverService";
import { userService } from "../../services/userService";
import type { Server } from "../../types/server";
import { newConnectionSchema } from "../../utils/validation";

interface NewConnectionModalProps {
	open: boolean;
	onClose: () => void;
	onCreate: () => void;
}

type NewConnectionFormData = z.infer<typeof newConnectionSchema>;

const NewConnectionModal = ({
	open,
	onClose,
	onCreate,
}: NewConnectionModalProps) => {
	const { t } = useLanguage();
	const [servers, setServers] = useState<Server[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [serverLoading, setServerLoading] = useState(true);
	const [priceInfo, setPriceInfo] = useState<{
		price: number;
		reason: string;
		price_type: string;
	} | null>(null);
	const [maxConnections, setMaxConnections] = useState(1);
	const [connectionsUsed, setConnectionsUsed] = useState(0);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		reset,
	} = useForm<NewConnectionFormData>({
		resolver: zodResolver(newConnectionSchema),
		defaultValues: {
			serverName: "",
			months: 1,
			connectionName: "",
			autoRenew: true,
		},
	});

	const months = watch("months");
	const pricePerConnection = priceInfo?.price ?? 0;
	const estimatedTotal = months * pricePerConnection * maxConnections;

	const fetchServers = useCallback(async () => {
		setServerLoading(true);
		try {
			const [serversData, priceData, connectionsData] = await Promise.all([
				serverService.getActiveServers(),
				userService.getUserPrice(),
				userService.getConnectionsUsed(),
			]);
			setServers(serversData);
			setPriceInfo({ price: priceData.price, reason: priceData.reason, price_type: priceData.price_type });
			setConnectionsUsed(connectionsData.used);
		} catch (err: unknown) {
			setError(t("modals.failedToLoadServers"));
			if (import.meta.env.DEV) console.error(err);
		} finally {
			setServerLoading(false);
		}
	}, [t]);

	useEffect(() => {
		if (open) {
			fetchServers();
			reset();
			setError("");
			setMaxConnections(1);
		}
	}, [open, reset, fetchServers]);

	const onSubmit = async (data: NewConnectionFormData) => {
		setLoading(true);
		setError("");
		try {
			const paymentResponse = await paymentService.initiatePayment({
				connection_name: data.connectionName || undefined,
				server_name: data.serverName,
				months: data.months,
				payment_method: "card",
			});

			if (paymentResponse.redirect_url) {
				window.location.href = paymentResponse.redirect_url;
			} else {
				onCreate();
				onClose();
			}
		} catch (err: unknown) {
			const message =
				err instanceof Error
					? err.message
					: t("modals.failedToCreateConnection");
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t("modals.newConnection")}</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<Box
					component="form"
					id="new-connection-form"
					onSubmit={handleSubmit(onSubmit)}
				>
					<FormControl fullWidth margin="normal" error={!!errors.serverName}>
						<InputLabel id="server-label">{t("modals.server")}</InputLabel>
						<Select
							labelId="server-label"
							label={t("modals.server")}
							{...register("serverName")}
							disabled={serverLoading}
						>
							{serverLoading && (
								<MenuItem value="">{t("common.loading")}</MenuItem>
							)}
							{servers.map((server) => (
								<MenuItem key={server.id} value={server.name}>
									{t(`servers.${server.name}`)} ({server.region})
								</MenuItem>
							))}
						</Select>
						{errors.serverName && (
							<Typography variant="caption" color="error">
								{errors.serverName.message}
							</Typography>
						)}
					</FormControl>
					<TextField
						margin="normal"
						fullWidth
						label={t("modals.connectionNameOptional")}
						{...register("connectionName")}
						error={!!errors.connectionName}
						helperText={
							errors.connectionName?.message || t("modals.connectionNameHelper")
						}
					/>
					<TextField
						margin="normal"
						fullWidth
						label={t("modals.months")}
						type="number"
						inputProps={{ min: 1, max: 36 }}
						{...register("months", { valueAsNumber: true })}
						error={!!errors.months}
						helperText={errors.months?.message}
					/>
					<FormControlLabel
						control={<Checkbox {...register("autoRenew")} defaultChecked />}
						label={t("modals.enableAutoRenew")}
					/>
					{!serverLoading && (
						<Box sx={{ mt: 2 }}>
							<Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
								{maxConnections} {maxConnections === 1 ? t("modals.connection") : t("modals.connections")}
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
								marks={[
									{ value: 1, label: "1" },
									{ value: 2, label: "2" },
									{ value: 3, label: "3" },
									{ value: 4, label: "4" },
									{ value: 5, label: "5" },
								]}
								valueLabelDisplay="auto"
								valueLabelFormat={(v) => v}
								sx={{ mb: 1 }}
							/>
						</Box>
					)}
					<Box
						sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}
					>
						{serverLoading ? (
							<CircularProgress size={20} />
						) : (
							<>
								<Typography variant="body2" color="textSecondary">
									{t("connectionCard.price")}: {pricePerConnection} ₽ × {maxConnections} = {pricePerConnection * maxConnections} ₽/{t("connectionCard.perMonth").replace("/", "").replace("мес", "мес.").replace("month", "mo.")}
								</Typography>
								<Typography variant="h6">
									{t("modals.total")} ({t("modals.estimated")}): ~{estimatedTotal} ₽ {t("modals.for")} {months}{" "}
									{months !== 1 ? t("modals.months") : t("modals.month")}
								</Typography>
	
							</>
						)}
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading || serverLoading}>
					{t("common.cancel")}
				</Button>
				<Button
					type="submit"
					form="new-connection-form"
					variant="contained"
					disabled={loading || serverLoading}
				>
					{loading ? <CircularProgress size={24} /> : t("modals.pay")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default NewConnectionModal;
