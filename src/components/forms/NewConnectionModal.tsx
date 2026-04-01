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
import { paymentService } from "../../services/paymentService";
import { serverService } from "../../services/serverService";
import type { Server } from "../../types/server";
import { newConnectionSchema } from "../../utils/validation";

interface NewConnectionModalProps {
	open: boolean;
	onClose: () => void;
	onCreate: () => void;
}

type NewConnectionFormData = z.infer<typeof newConnectionSchema>;

const PRICE_PER_MONTH = 5;

const NewConnectionModal = ({
	open,
	onClose,
	onCreate,
}: NewConnectionModalProps) => {
	const [servers, setServers] = useState<Server[]>([]);
	const [loading, setLoading] = useState(false);
	const [graceLoading, setGraceLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [serverLoading, setServerLoading] = useState(true);

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
	const totalPrice = months * PRICE_PER_MONTH;

	const fetchServers = useCallback(async () => {
		setServerLoading(true);
		try {
			const data = await serverService.getActiveServers();
			setServers(data);
		} catch (err: any) {
			setError("Failed to load servers");
			console.error(err);
		} finally {
			setServerLoading(false);
		}
	}, []);

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
			setError(err.message || "Failed to create connection");
		} finally {
			setLoading(false);
		}
	};

	const onSubmitGracePeriod = async (data: NewConnectionFormData) => {
		setGraceLoading(true);
		setError("");
		try {
			const paymentResponse = await paymentService.initiatePayment({
				server_name: data.serverName,
				months: data.months,
				grace_period: true,
			});

			if (paymentResponse.redirect_url) {
				window.location.href = paymentResponse.redirect_url;
			} else {
				onCreate();
				onClose();
			}
		} catch (err: any) {
			setError(err.message || "Failed to create connection with grace period");
		} finally {
			setGraceLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Create New Connection</DialogTitle>
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
						<InputLabel id="server-label">Server</InputLabel>
						<Select
							labelId="server-label"
							label="Server"
							{...register("serverName")}
							disabled={serverLoading}
						>
							{serverLoading && <MenuItem value="">Loading...</MenuItem>}
							{servers.map((server) => (
								<MenuItem key={server.id} value={server.name}>
									{server.name} ({server.region})
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
						label="Connection Name (optional)"
						{...register("connectionName")}
						error={!!errors.connectionName}
						helperText={
							errors.connectionName?.message ||
							"Leave empty to generate automatically"
						}
					/>
					<TextField
						margin="normal"
						fullWidth
						label="Months"
						type="number"
						inputProps={{ min: 1, max: 36 }}
						{...register("months", { valueAsNumber: true })}
						error={!!errors.months}
						helperText={errors.months?.message}
					/>
					<FormControlLabel
						control={<Checkbox {...register("autoRenew")} defaultChecked />}
						label="Enable auto-renew"
					/>
					<Box
						sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}
					>
						<Typography variant="body2" color="textSecondary">
							Price per month: ${PRICE_PER_MONTH}
						</Typography>
						<Typography variant="h6">
							Total: ${totalPrice.toFixed(2)} for {months} month
							{months !== 1 ? "s" : ""}
						</Typography>
						<Typography variant="caption" color="textSecondary">
							Payment will be processed after you confirm.
						</Typography>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading || graceLoading}>
					Cancel
				</Button>
				<Button
					type="button"
					onClick={handleSubmit(onSubmitGracePeriod)}
					variant="outlined"
					disabled={loading || graceLoading || serverLoading}
					sx={{ mr: 1 }}
				>
					{graceLoading ? <CircularProgress size={24} /> : "Обещанный платёж"}
				</Button>
				<Button
					type="submit"
					form="new-connection-form"
					variant="contained"
					disabled={loading || graceLoading || serverLoading}
				>
					{loading ? <CircularProgress size={24} /> : "Оплатить"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default NewConnectionModal;
