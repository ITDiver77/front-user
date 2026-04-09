import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Snackbar,
	Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n";
import { connectionService } from "../../services/connectionService";
import type { Connection, Inbound } from "../../types/connection";
import { formatDate, getConnectionStatus } from "../../utils/dateHelpers";

interface ConnectionDetailsModalProps {
	open: boolean;
	onClose: () => void;
	connection: Connection;
	onRefresh?: () => void;
}

const ConnectionDetailsModal = ({
	open,
	onClose,
	connection,
	onRefresh,
}: ConnectionDetailsModalProps) => {
	const { t } = useLanguage();
	const tRef = useRef(t);
	tRef.current = t;
	const [inbounds, setInbounds] = useState<Inbound[]>([]);
	const [inboundsLoading, setInboundsLoading] = useState(false);
	const [inboundsError, setInboundsError] = useState<string | null>(null);
	const [switchingInboundId, setSwitchingInboundId] = useState<number | null>(
		null,
	);
	const [reenableLoading, setReenableLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({ open: false, message: "", severity: "success" });

	useEffect(() => {
		if (open && connection.is_active) {
			setInboundsLoading(true);
			setInboundsError(null);
			connectionService
				.getAvailableInbounds(connection.connection_name)
				.then((data) => {
					setInbounds(data);
				})
				.catch(() => {
					setInboundsError(tRef.current("connectionCard.inboundsError"));
				})
				.finally(() => {
					setInboundsLoading(false);
				});
		} else {
			setInbounds([]);
			setInboundsError(null);
		}
	}, [open, connection.is_active, connection.connection_name]);

	const handleReenable = async () => {
		setReenableLoading(true);
		try {
			await connectionService.reenableConnection(connection.connection_name);
			setSnackbar({
				open: true,
				message: t("connectionCard.reenableSuccess"),
				severity: "success",
			});
			setTimeout(() => onRefresh?.(), 2000);
		} catch {
			setSnackbar({
				open: true,
				message: t("connectionCard.reenableFailed"),
				severity: "error",
			});
		} finally {
			setReenableLoading(false);
		}
	};

	const handleSwitchInbound = async (inboundId: number) => {
		setSwitchingInboundId(inboundId);
		try {
			await connectionService.switchInbound(
				connection.connection_name,
				inboundId,
			);
			setSnackbar({
				open: true,
				message: t("connectionCard.switchInboundSuccess"),
				severity: "success",
			});
			setTimeout(() => onRefresh?.(), 2000);
		} catch {
			setSnackbar({
				open: true,
				message: t("connectionCard.switchInboundFailed"),
				severity: "error",
			});
		} finally {
			setSwitchingInboundId(null);
		}
	};

	const status = getConnectionStatus(
		connection.enabled,
		connection.is_active,
		connection.paydate,
		connection.grace_date,
	);

	const details = [
		{
			label: t("connectionCard.server"),
			value: connection.server_name || t("modals.unknown"),
		},
		{
			label: t("connectionCard.connectionName"),
			value: connection.connection_name,
		},
		{
			label: t("connectionCard.maxConnections"),
			value: connection.max_connections || 1,
		},
		{
			label: t("connectionCard.price"),
			value: `${connection.price} ₽`,
		},
		{
			label: t("connectionCard.status"),
			value: t(`connectionCard.${status}`),
		},
		{
			label: t("connectionCard.nextPayment"),
			value: formatDate(connection.paydate),
		},
		{
			label: t("connectionCard.autoRenew"),
			value: connection.auto_renew
				? t("connectionCard.on")
				: t("connectionCard.off"),
		},
		{
			label: t("connectionCard.enabled"),
			value: connection.enabled
				? t("connectionCard.yes")
				: t("connectionCard.no"),
		},
		{
			label: t("connectionCard.active"),
			value: connection.is_active
				? t("connectionCard.yes")
				: t("connectionCard.no"),
		},
		{
			label: t("connectionCard.createdAt"),
			value: formatDate(connection.created_at),
		},
	];

	if (connection.grace_date) {
		details.splice(5, 0, {
			label: t("connectionCard.gracePeriod"),
			value: formatDate(connection.grace_date),
		});
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>{connection.connection_name}</DialogTitle>
			<DialogContent>
				<Grid container spacing={2}>
					{details.map((detail) => (
						<Grid item xs={6} key={detail.label}>
							<Typography variant="body2" color="text.secondary">
								{detail.label}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{detail.value}
							</Typography>
						</Grid>
					))}
				</Grid>

				<Divider sx={{ my: 2 }} />

				{connection.subscription_url && (
					<>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
							Subscription URL:
						</Typography>
						<Typography
							variant="body2"
							sx={{
								fontFamily: "monospace",
								backgroundColor: "action.hover",
								p: 1,
								borderRadius: 1,
								wordBreak: "break-all",
								mb: 2,
							}}
						>
							{connection.subscription_url}
						</Typography>
					</>
				)}

				<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
					{t("connectionCard.connectionString")}:
				</Typography>
				<Typography
					variant="body2"
					sx={{
						fontFamily: "monospace",
						backgroundColor: "action.hover",
						p: 1,
						borderRadius: 1,
						wordBreak: "break-all",
					}}
				>
					{connection.connection_string || t("common.noData")}
				</Typography>

				{connection.is_active && (
					<>
						<Divider sx={{ my: 2 }} />
						<Typography variant="subtitle2" sx={{ mb: 1 }}>
							{t("connectionCard.availableInbounds")}
						</Typography>
						{inboundsLoading && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									py: 1,
								}}
							>
								<CircularProgress size={20} />
								<Typography variant="body2" color="text.secondary">
									{t("connectionCard.loadingInbounds")}
								</Typography>
							</Box>
						)}
						{inboundsError && (
							<Alert severity="error" sx={{ mt: 1 }}>
								{inboundsError}
							</Alert>
						)}
						{!inboundsLoading && !inboundsError && inbounds.length === 0 && (
							<Typography variant="body2" color="text.secondary">
								{t("connectionCard.noInbounds")}
							</Typography>
						)}
						{!inboundsLoading && !inboundsError && inbounds.length > 0 && (
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 1,
									mt: 1,
								}}
							>
								{inbounds.map((inbound) => (
									<Box
										key={inbound.id}
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											p: 1,
											borderRadius: 1,
											backgroundColor: "action.hover",
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
											}}
										>
											<Chip
												label={inbound.protocol.toUpperCase()}
												size="small"
												color="primary"
												variant="outlined"
											/>
											<Typography variant="body2">{inbound.tag}</Typography>
											<Typography variant="body2" color="text.secondary">
												:{inbound.port}
											</Typography>
										</Box>
										<Button
											variant="outlined"
											size="small"
											onClick={() => handleSwitchInbound(inbound.id)}
											disabled={switchingInboundId !== null}
										>
											{switchingInboundId === inbound.id ? (
												<CircularProgress size={16} />
											) : (
												t("connectionCard.switchInbound")
											)}
										</Button>
									</Box>
								))}
							</Box>
						)}
					</>
				)}
			</DialogContent>
			<DialogActions>
				{!connection.enabled && (
					<Button
						onClick={handleReenable}
						disabled={reenableLoading}
						color="success"
						variant="contained"
					>
						{reenableLoading ? (
							<CircularProgress size={20} />
						) : (
							t("connectionCard.reenableConnection")
						)}
					</Button>
				)}
				<Box sx={{ flexGrow: 1 }} />
				<Button onClick={onClose}>{t("common.close")}</Button>
			</DialogActions>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Dialog>
	);
};

export default ConnectionDetailsModal;
