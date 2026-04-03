import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Typography,
} from "@mui/material";
import { useLanguage } from "../../i18n";
import type { Connection } from "../../types/connection";
import { formatDate, getConnectionStatus } from "../../utils/dateHelpers";

interface ConnectionDetailsModalProps {
	open: boolean;
	onClose: () => void;
	connection: Connection;
}

const ConnectionDetailsModal = ({
	open,
	onClose,
	connection,
}: ConnectionDetailsModalProps) => {
	const { t } = useLanguage();

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
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>{t("common.close")}</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConnectionDetailsModal;
