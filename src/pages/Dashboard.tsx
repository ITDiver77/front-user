import {
	Add as AddIcon,
	Sync as SyncIcon,
	Wifi as WifiIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	FormControlLabel,
	Grid,
	IconButton,
	Snackbar,
	Switch,
	Tooltip,
	Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import ConnectionCard from "../components/common/ConnectionCard";
import { EmptyState } from "../components/common/EmptyState";
import ChangeServerModal from "../components/forms/ChangeServerModal";
import NewConnectionModal from "../components/forms/NewConnectionModal";
import PaymentInitiationModal from "../components/forms/PaymentInitiationModal";
import { useConnectionStatusContext } from "../contexts/ConnectionStatusContext";
import { useLanguage } from "../i18n";
import { ApiError } from "../services/api";
import { connectionService } from "../services/connectionService";
import { staggerContainer } from "../styles/animations";
import type { Connection } from "../types/connection";

const Dashboard = () => {
	const {
		connections,
		loading: contextLoading,
		error: contextError,
		lastUpdated,
		isActive,
		setIsActive,
		refresh,
		isStatusChanged,
		acknowledgeStatusChange,
	} = useConnectionStatusContext();
	const { t } = useLanguage();

	const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
	const [changeServerModalOpen, setChangeServerModalOpen] = useState(false);
	const [selectedConnection, setSelectedConnection] =
		useState<Connection | null>(null);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [paymentConnection, setPaymentConnection] = useState<Connection | null>(
		null,
	);
	const [showDeleted, setShowDeleted] = useState(false);
	const [localError, setLocalError] = useState<string>("");
	const [showNoPaidWarning, setShowNoPaidWarning] = useState(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info";
	}>({ open: false, message: "", severity: "success" });

	const loading = contextLoading;
	const error = contextError || localError;

	const fetchConnections = useCallback(async () => {
		try {
			await refresh();
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setLocalError(err.message || "Failed to fetch connections");
			} else {
				setLocalError("Failed to fetch connections");
			}
		}
	}, [refresh]);

	const hasPaidConnections = useMemo(
		() =>
			connections.some((conn) => {
				if (conn.is_deleted) return false;
				const payDate = new Date(conn.paydate);
				return payDate > new Date();
			}),
		[connections],
	);

	useEffect(() => {
		fetchConnections();
	}, [fetchConnections]);

	const handleToggleAutoRenew = async (
		connectionName: string,
		autoRenew: boolean,
	) => {
		try {
			await connectionService.toggleAutoRenew(connectionName, autoRenew);
			fetchConnections();
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setSnackbar({ open: true, message: err.message, severity: "error" });
			} else {
				setSnackbar({
					open: true,
					message: t("common.error"),
					severity: "error",
				});
			}
		}
	};

	const handleExtend = (connectionName: string) => {
		const conn = connections.find((c) => c.connection_name === connectionName);
		if (conn) {
			setPaymentConnection(conn);
			setPaymentModalOpen(true);
		}
	};

	const handleRequestGrace = async (connectionName: string) => {
		try {
			const result = await connectionService.requestGrace(connectionName);
			setSnackbar({
				open: true,
				message: result.message || t("dashboard.graceRequested"),
				severity: "success",
			});
			fetchConnections();
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setSnackbar({
					open: true,
					message: t("dashboard.graceRequestFailed"),
					severity: "error",
				});
			} else {
				setSnackbar({
					open: true,
					message: t("common.error"),
					severity: "error",
				});
			}
		}
	};

	const handleDeleteConnection = async (connectionName: string) => {
		try {
			await connectionService.updateMyConnection(connectionName, {
				marked_for_deletion: true,
			});
			setSnackbar({
				open: true,
				message: t("dashboard.connectionDeleted"),
				severity: "success",
			});
			fetchConnections();
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setSnackbar({
					open: true,
					message: t("dashboard.deleteConnection"),
					severity: "error",
				});
			} else {
				setSnackbar({
					open: true,
					message: t("common.error"),
					severity: "error",
				});
			}
		}
	};

	const handleCancelDeletion = async (connectionName: string) => {
		try {
			await connectionService.cancelDeletion(connectionName);
			setSnackbar({
				open: true,
				message: t("dashboard.deletionCancelled"),
				severity: "success",
			});
			fetchConnections();
		} catch (err: unknown) {
			if (err instanceof ApiError) {
				setSnackbar({
					open: true,
					message: t("dashboard.cancelDeletionFailed"),
					severity: "error",
				});
			} else {
				setSnackbar({
					open: true,
					message: t("common.error"),
					severity: "error",
				});
			}
		}
	};

	const handleServerChangeSuccess = () => {
		fetchConnections();
		setChangeServerModalOpen(false);
		setSelectedConnection(null);
	};

	const handleCloseChangeServerModal = () => {
		setChangeServerModalOpen(false);
		setSelectedConnection(null);
	};

	const handlePaymentSuccess = (_paymentId: number) => {
		fetchConnections();
		setPaymentModalOpen(false);
		setPaymentConnection(null);
	};

	const handleClosePaymentModal = () => {
		setPaymentModalOpen(false);
		setPaymentConnection(null);
	};

	const handleOpenNewConnectionModal = () => {
		if (!hasPaidConnections) {
			setShowNoPaidWarning(true);
			return;
		}
		setShowNewConnectionModal(true);
	};

	const filteredConnections = showDeleted
		? connections
		: connections.filter((c) => !c.is_deleted);

	const deletedCount = connections.filter((c) => c.is_deleted).length;

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="60vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
					flexWrap: "wrap",
					gap: 2,
				}}
			>
				<Typography variant="h4">{t("dashboard.myConnections")}</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					{lastUpdated && (
						<Typography variant="caption" color="text.secondary">
							{t("dashboard.updated")}: {lastUpdated.toLocaleTimeString()}
						</Typography>
					)}
					<Tooltip
						title={
							isActive
								? t("dashboard.disableAutoRefresh")
								: t("dashboard.enableAutoRefresh")
						}
					>
						<FormControlLabel
							control={
								<Switch
									checked={isActive}
									onChange={(e) => setIsActive(e.target.checked)}
									size="small"
									color="success"
								/>
							}
							label={isActive ? t("dashboard.live") : t("dashboard.paused")}
							sx={{ mr: 1 }}
						/>
					</Tooltip>
					<Tooltip title={t("dashboard.refreshNow")}>
						<IconButton
							onClick={() => refresh()}
							size="small"
							component={motion.button}
							whileHover={{ rotate: 180 }}
							transition={{ duration: 0.3 }}
						>
							<SyncIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleOpenNewConnectionModal}
					>
						{t("dashboard.newConnection")}
					</Button>
				</Box>
			</Box>

			{deletedCount > 0 && (
				<Box sx={{ mb: 2 }}>
					<FormControlLabel
						control={
							<Switch
								checked={showDeleted}
								onChange={(e) => setShowDeleted(e.target.checked)}
							/>
						}
						label={`${t("dashboard.showDeleted")} (${deletedCount})`}
					/>
				</Box>
			)}

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			{showNoPaidWarning && (
				<Alert
					severity="warning"
					sx={{ mb: 2 }}
					onClose={() => setShowNoPaidWarning(false)}
				>
					{t("dashboard.noPaidForNewConnection")}
				</Alert>
			)}
			{filteredConnections.length === 0 ? (
				<motion.div
					variants={staggerContainer}
					initial="initial"
					animate="animate"
				>
					<EmptyState
						icon={<WifiIcon />}
						title={
							showDeleted
								? t("dashboard.noConnectionsFound")
								: t("dashboard.noConnections")
						}
						description={
							showDeleted
								? t("dashboard.noConnectionsMatchFilters")
								: t("dashboard.createFirst")
						}
						action={
							!showDeleted && (
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={handleOpenNewConnectionModal}
									sx={{ mt: 2 }}
								>
									{t("dashboard.createConnection")}
								</Button>
							)
						}
					/>
				</motion.div>
			) : (
				<Grid container spacing={3}>
					{filteredConnections.map((conn) => (
						<Grid item key={conn.id} xs={12} sm={6} md={4}>
							<ConnectionCard
								connection={conn}
								onToggleAutoRenew={handleToggleAutoRenew}
								onExtend={handleExtend}
								onRequestGrace={handleRequestGrace}
								onDeleteConnection={handleDeleteConnection}
								onCancelDeletion={handleCancelDeletion}
								showStatusAnimation={isStatusChanged(conn.connection_name)}
								onAnimationComplete={() =>
									acknowledgeStatusChange(conn.connection_name)
								}
							/>
						</Grid>
					))}
				</Grid>
			)}
			{showNewConnectionModal && (
				<NewConnectionModal
					open={showNewConnectionModal}
					onClose={() => setShowNewConnectionModal(false)}
					onCreate={fetchConnections}
				/>
			)}

			{changeServerModalOpen && selectedConnection && (
				<ChangeServerModal
					open={changeServerModalOpen}
					onClose={handleCloseChangeServerModal}
					connectionName={selectedConnection.connection_name}
					currentServerName={selectedConnection.server_name}
					onSuccess={handleServerChangeSuccess}
				/>
			)}

			{paymentModalOpen && paymentConnection && (
				<PaymentInitiationModal
					open={paymentModalOpen}
					onClose={handleClosePaymentModal}
					connectionName={paymentConnection.connection_name}
					currentPrice={paymentConnection.price}
					connections={connections}
					onSuccess={handlePaymentSuccess}
				/>
			)}

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					severity={snackbar.severity}
					onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default Dashboard;
