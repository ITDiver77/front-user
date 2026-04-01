import { Add as AddIcon, Sync as SyncIcon, Wifi as WifiIcon } from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	FormControlLabel,
	Grid,
	IconButton,
	Switch,
	Tooltip,
	Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import ConnectionCard from "../components/common/ConnectionCard";
import { EmptyState } from "../components/common/EmptyState";
import ChangeServerModal from "../components/forms/ChangeServerModal";
import NewConnectionModal from "../components/forms/NewConnectionModal";
import PaymentInitiationModal from "../components/forms/PaymentInitiationModal";
import { connectionService } from "../services/connectionService";
import { staggerContainer } from "../styles/animations";
import type { Connection } from "../types/connection";
import { useConnectionStatusContext } from "../contexts/ConnectionStatusContext";

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

	const loading = contextLoading;
	const error = contextError || localError;

	const fetchConnections = useCallback(async () => {
		try {
			await refresh();
		} catch (err: any) {
			setLocalError(err.message || "Failed to fetch connections");
		}
	}, [refresh]);

	const hasPaidConnections = connections.some((conn) => {
		if (conn.is_deleted) return false;
		const payDate = new Date(conn.paydate);
		return payDate > new Date();
	});

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
		} catch (err) {
			console.error("Failed to toggle auto-renew", err);
		}
	};

	const handleToggleEnabled = async (
		connectionName: string,
		enabled: boolean,
	) => {
		try {
			await connectionService.toggleEnabled(connectionName, enabled);
			fetchConnections();
		} catch (err) {
			console.error("Failed to toggle enabled state", err);
		}
	};

	const handleCopyConfig = (connectionString: string) => {
		console.log("Copy config:", connectionString);
	};

	const handleExtend = (connectionName: string) => {
		const conn = connections.find((c) => c.connection_name === connectionName);
		if (conn) {
			setPaymentConnection(conn);
			setPaymentModalOpen(true);
		}
	};

	const handleChangeServer = (connectionName: string) => {
		const conn = connections.find((c) => c.connection_name === connectionName);
		if (conn) {
			setSelectedConnection(conn);
			setChangeServerModalOpen(true);
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

	// Filter connections based on showDeleted toggle
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
				<Typography variant="h4">My Connections</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					{lastUpdated && (
						<Typography variant="caption" color="text.secondary">
							Updated: {lastUpdated.toLocaleTimeString()}
						</Typography>
					)}
					<Tooltip title={isActive ? "Disable auto-refresh" : "Enable auto-refresh"}>
						<FormControlLabel
							control={
								<Switch
									checked={isActive}
									onChange={(e) => setIsActive(e.target.checked)}
									size="small"
									color="success"
								/>
							}
							label={isActive ? "Live" : "Paused"}
							sx={{ mr: 1 }}
						/>
					</Tooltip>
					<Tooltip title="Refresh now">
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
						New Connection
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
						label={`Show deleted connections (${deletedCount})`}
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
					Для использования «Обещанного платежа» необходимо сначала совершить оплату. Пожалуйста, оплатите существующее подключение или подождите, пока оно станет активным.
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
						title={showDeleted ? "No Connections Found" : "No Connections Yet"}
						description={
							showDeleted
								? "No connections match your filters."
								: "Create your first VPN connection to get started."
						}
						action={
							!showDeleted && (
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={handleOpenNewConnectionModal}
									sx={{ mt: 2 }}
								>
									Create Connection
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
								onCopyConfig={handleCopyConfig}
								onExtend={handleExtend}
								onChangeServer={handleChangeServer}
								onToggleEnabled={handleToggleEnabled}
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
					onSuccess={handlePaymentSuccess}
				/>
			)}
		</Box>
	);
};

export default Dashboard;
