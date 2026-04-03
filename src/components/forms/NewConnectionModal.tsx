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
	TextField,
	Typography,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
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
	const [priceInfo, setPriceInfo] = useState<{ price: number; reason: string } | null>(null);

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
	const pricePerMonth = priceInfo?.price ?? 0;
	const totalPrice = months * pricePerMonth;

	const fetchServers = useCallback(async () => {
		setServerLoading(true);
		try {
			const [serversData, priceData] = await Promise.all([
				serverService.getActiveServers(),
				userService.getUserPrice(),
			]);
			setServers(serversData);
			setPriceInfo({ price: priceData.price, reason: priceData.reason });
		} catch (err: any) {
			setError(t("modals.failedToLoadServers"));
			console.error(err);
		} finally {
			setServerLoading(false);
		}
	}, [t]);

	useEffect(() => {
		if (open) {
			fetchServers();
			reset();
			setError("");
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
		} catch (err: any) {
			setError(err.message || t("modals.failedToCreateConnection"));
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
							{serverLoading && <MenuItem value="">{t("common.loading")}</MenuItem>}
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
							errors.connectionName?.message ||
							t("modals.connectionNameHelper")
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
					<Box
						sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}
					>
						{serverLoading ? (
							<CircularProgress size={20} />
						) : (
							<>
								<Typography variant="body2" color="textSecondary">
									{t("modals.pricePerMonth")}: {pricePerMonth} ₽
								</Typography>
								<Typography variant="h6">
									{t("modals.total")}: {totalPrice} ₽ {t("modals.for")} {months} {months !== 1 ? t("modals.months") : t("modals.month")}
								</Typography>
								{priceInfo?.reason && (
									<Typography variant="caption" color="textSecondary">
										{priceInfo.reason}
									</Typography>
								)}
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
