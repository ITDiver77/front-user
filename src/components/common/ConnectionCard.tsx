import {
	Check as CheckIcon,
	ContentCopy as CopyIcon,
	Delete as DeleteIcon,
	Payment as PaymentIcon,
	Settings as SettingsIcon,
	Sync as SyncIcon,
	Wifi as WifiIcon,
	WifiOff as WifiOffIcon,
} from "@mui/icons-material";
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	LinearProgress,
	Switch,
	Tooltip,
	Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "../../i18n";
import { connectionService } from "../../services/connectionService";
import {
	cardVariants,
	copySuccessVariants,
	pulseVariants,
} from "../../styles/animations";
import type { Connection } from "../../types/connection";
import { getCopyValue } from "../../utils/connectionHelpers";
import {
	formatDate,
	getConnectionStatus,
	getDaysRemaining,
	getStatusColor,
} from "../../utils/dateHelpers";
import ChangeServerModal from "../forms/ChangeServerModal";
import ConnectionDetailsModal from "../forms/ConnectionDetailsModal";
import EditConnectionModal from "../forms/EditConnectionModal";

interface ConnectionCardProps {
	connection: Connection;
	onToggleAutoRenew: (connectionName: string, autoRenew: boolean) => void;
	onExtend: (connectionName: string) => void;
	onRequestGrace: (connectionName: string) => void;
	onDeleteConnection: (connectionName: string) => void;
	onCancelDeletion: (connectionName: string) => void;
	showStatusAnimation?: boolean;
	onAnimationComplete?: () => void;
}

const ConnectionCard = ({
	connection,
	onToggleAutoRenew,
	onExtend,
	onRequestGrace,
	onDeleteConnection,
	onCancelDeletion,
	showStatusAnimation = false,
	onAnimationComplete,
}: ConnectionCardProps) => {
	const { t } = useLanguage();
	const [autoRenew, setAutoRenew] = useState(connection.auto_renew ?? false);
	const [copySuccess, setCopySuccess] = useState(false);

	// Modal states
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [detailsModalOpen, setDetailsModalOpen] = useState(false);
	const [changeServerModalOpen, setChangeServerModalOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [cancelLoading, setCancelLoading] = useState(false);

	const enabled = connection.enabled;
	const hasGraceDate =
		connection.grace_date !== null && connection.grace_date !== undefined;
	const status = getConnectionStatus(
		connection.enabled,
		connection.is_active,
		connection.paydate,
		connection.grace_date,
	);
	const daysRemaining = getDaysRemaining(connection.paydate);
	const statusColor = getStatusColor(status);
	const isMarkedForDeletion = connection.marked_for_deletion === true;
	const isFirstConnection = connection.index === 1;

	// Check if can show grace period button
	const payDate = new Date(connection.paydate);
	const now = new Date();
	const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
	const canRequestGrace = payDate <= oneDayFromNow;

	const handleToggleAutoRenew = () => {
		const newValue = !autoRenew;
		setAutoRenew(newValue);
		onToggleAutoRenew(connection.connection_name, newValue);
	};

	const handleDoubleClick = () => {
		setDetailsModalOpen(true);
	};

	const handleCopyConfig = () => {
		const value = getCopyValue(connection);
		if (value) {
			navigator.clipboard.writeText(value).then(() => {
				setCopySuccess(true);
				setTimeout(() => setCopySuccess(false), 2000);
			});
		}
	};

	const handleSaveMaxConnections = async (
		maxConnections: number,
		_newPrice: number,
	) => {
		await connectionService.updateMyConnection(connection.connection_name, {
			max_connections: maxConnections,
		});
	};

	const handleCancelDeletion = async () => {
		setCancelLoading(true);
		try {
			await connectionService.cancelDeletion(connection.connection_name);
			onCancelDeletion(connection.connection_name);
		} catch (error) {
			console.error("Failed to cancel deletion:", error);
		} finally {
			setCancelLoading(false);
		}
	};

	const isDeleted = connection.is_deleted === true;

	return (
		<>
			<motion.div
				variants={cardVariants}
				initial="initial"
				animate="animate"
				whileHover="hover"
				whileTap="tap"
				style={{ opacity: isDeleted ? 0.6 : 1 }}
			>
				<Card
					sx={{
						minWidth: 300,
						maxWidth: 400,
						m: 1,
						position: "relative",
						overflow: "visible",
					}}
					onDoubleClick={handleDoubleClick}
				>
					<CardContent>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								mb: 2,
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", damping: 10 }}
								>
									{enabled && !isDeleted ? (
										<WifiIcon color="success" fontSize="small" />
									) : (
										<WifiOffIcon color="disabled" fontSize="small" />
									)}
								</motion.div>
								<Typography variant="h6" component="div" fontWeight={600}>
									{connection.connection_name}
								</Typography>
							</Box>
							<Box sx={{ display: "flex", gap: 0.5 }}>
								{isMarkedForDeletion && (
									<Tooltip title={t("connectionCard.deleteTooltip")}>
										<Chip
											label={t(
												"connectionCard.markedForDeletion",
											).toUpperCase()}
											color="warning"
											size="small"
											variant="outlined"
										/>
									</Tooltip>
								)}
								{isDeleted && !isMarkedForDeletion && (
									<Chip
										label={t("connectionCard.deleted").toUpperCase()}
										color="error"
										size="small"
										variant="outlined"
									/>
								)}
								<motion.div whileHover={{ scale: 1.05 }}>
									<Chip
										label={t(`connectionCard.${status}`).toUpperCase()}
										color={statusColor}
										size="small"
										sx={{
											fontWeight: 600,
											boxShadow: (theme) =>
												theme.palette.mode === "light"
													? `0 2px 8px ${theme.palette[statusColor]?.main}40`
													: undefined,
										}}
										component={showStatusAnimation ? motion.div : "div"}
										initial={showStatusAnimation ? "initial" : undefined}
										animate={showStatusAnimation ? "pulse" : undefined}
										variants={showStatusAnimation ? pulseVariants : undefined}
										onAnimationComplete={
											showStatusAnimation ? onAnimationComplete : undefined
										}
									/>
								</motion.div>
							</Box>
						</Box>

						<Typography color="text.secondary" gutterBottom variant="body2">
							{t("connectionCard.server")}:{" "}
							<strong>{connection.server_name || "Unknown"}</strong>
						</Typography>
						<Typography variant="body2">
							{t("connectionCard.price")}: <strong>{connection.price} ₽</strong>{" "}
							{t("connectionCard.perMonth")}
						</Typography>
						{hasGraceDate ? (
							<Typography variant="body2" color="info.main">
								{t("connectionCard.gracePeriod")}:{" "}
								{formatDate(connection.grace_date as string)}
							</Typography>
						) : (
							<Typography variant="body2" color="text.secondary">
								{t("connectionCard.nextPayment")}:{" "}
								{formatDate(connection.paydate)}
							</Typography>
						)}
						<Typography
							variant="body2"
							fontWeight={500}
							color={
								daysRemaining > 7
									? "text.primary"
									: daysRemaining > 0
										? "warning.main"
										: "error.main"
							}
						>
							{t("connectionCard.daysRemaining")}:{" "}
							{daysRemaining > 0
								? `${daysRemaining} ${t("connectionCard.days")}`
								: t("connectionCard.expired")}
						</Typography>

						{daysRemaining > 0 && daysRemaining <= 7 && (
							<Box sx={{ mt: 1 }}>
								<LinearProgress
									variant="determinate"
									value={(daysRemaining / 7) * 100}
									sx={{
										height: 6,
										borderRadius: 3,
										bgcolor: "action.hover",
										"& .MuiLinearProgress-bar": {
											borderRadius: 3,
										},
									}}
								/>
							</Box>
						)}

						<Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
							<Typography variant="body2" sx={{ mr: 1 }}>
								{t("connectionCard.autoRenew")}:
							</Typography>
							<Switch
								checked={autoRenew}
								onChange={handleToggleAutoRenew}
								size="small"
								disabled={isDeleted}
							/>
							<Typography variant="body2" color="text.secondary">
								{autoRenew ? t("connectionCard.on") : t("connectionCard.off")}
							</Typography>
						</Box>
					</CardContent>

					<CardActions disableSpacing sx={{ px: 2, pb: 2 }}>
						<Tooltip title={t("connectionCard.copyString")}>
							<span>
								<IconButton
									onClick={handleCopyConfig}
									size="small"
									aria-label={t("connectionCard.copyString")}
									disabled={isDeleted}
									component={motion.button}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
								>
									<AnimatePresence mode="wait">
										{copySuccess ? (
											<motion.div
												key="check"
												variants={copySuccessVariants}
												initial="initial"
												animate="animate"
												exit="exit"
											>
												<CheckIcon color="success" fontSize="small" />
											</motion.div>
										) : (
											<motion.div key="copy">
												<CopyIcon fontSize="small" />
											</motion.div>
										)}
									</AnimatePresence>
								</IconButton>
							</span>
						</Tooltip>
						{copySuccess && (
							<Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
								{t("connectionCard.copied")}
							</Typography>
						)}
						<Tooltip title={t("connectionCard.extendPay")}>
							<span>
								<IconButton
									onClick={() => onExtend(connection.connection_name)}
									size="small"
									aria-label={t("connectionCard.extendPay")}
									disabled={isDeleted}
									component={motion.button}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
								>
									<PaymentIcon fontSize="small" />
								</IconButton>
							</span>
						</Tooltip>
						{/* Settings icon - opens EditConnectionModal */}
						<Tooltip title={t("connectionCard.editConnection")}>
							<span>
								<IconButton
									onClick={() => setEditModalOpen(true)}
									size="small"
									aria-label={t("connectionCard.editConnection")}
									disabled={isDeleted}
									component={motion.button}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
								>
									<SettingsIcon fontSize="small" />
								</IconButton>
							</span>
						</Tooltip>
						{/* Change Server icon - opens ChangeServerModal */}
						<Tooltip title={t("connectionCard.changeServer")}>
							<span>
								<IconButton
									onClick={() => setChangeServerModalOpen(true)}
									size="small"
									aria-label={t("connectionCard.changeServer")}
									disabled={isDeleted}
									component={motion.button}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
								>
									<SyncIcon fontSize="small" />
								</IconButton>
							</span>
						</Tooltip>
						<Box sx={{ flexGrow: 1 }} />
						{/* Delete or Cancel Deletion button */}
						{isMarkedForDeletion ? (
							<Button
								variant="outlined"
								size="small"
								color="warning"
								onClick={handleCancelDeletion}
								disabled={cancelLoading}
							>
								{cancelLoading ? (
									<CircularProgress size={16} />
								) : (
									t("connectionCard.cancelDeletion")
								)}
							</Button>
						) : !isDeleted ? (
							<Tooltip title={t("connectionCard.deleteConnection")}>
								<span>
									<IconButton
										onClick={() => setDeleteDialogOpen(true)}
										size="small"
										aria-label={t("connectionCard.deleteConnection")}
										component={motion.button}
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
									>
										<DeleteIcon fontSize="small" color="error" />
									</IconButton>
								</span>
							</Tooltip>
						) : null}
						{!hasGraceDate &&
							!isDeleted &&
							!isMarkedForDeletion &&
							canRequestGrace && (
								<Button
									variant="contained"
									size="small"
									color="info"
									onClick={() => onRequestGrace(connection.connection_name)}
									sx={{ ml: 1 }}
								>
									{t("connectionCard.promisedPayment")}
								</Button>
							)}
					</CardActions>
				</Card>
			</motion.div>

			{/* Edit Connection Modal */}
			<EditConnectionModal
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				connection={connection}
				isFirstConnection={isFirstConnection}
				onSave={handleSaveMaxConnections}
			/>

			{/* Connection Details Modal */}
			<ConnectionDetailsModal
				open={detailsModalOpen}
				onClose={() => setDetailsModalOpen(false)}
				connection={connection}
				onRefresh={() => window.location.reload()}
			/>

			{/* Change Server Modal */}
			<ChangeServerModal
				open={changeServerModalOpen}
				onClose={() => setChangeServerModalOpen(false)}
				connectionName={connection.connection_name}
				currentServerName={connection.server_name}
				onSuccess={() => {
					// Refresh data after server change
					window.location.reload();
				}}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>{t("connectionCard.confirmDeleteTitle")}</DialogTitle>
				<DialogContent>
					<Alert severity="warning" sx={{ mb: 2 }}>
						{t("connectionCard.deleteWarning")}
					</Alert>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={() => {
							onDeleteConnection(connection.connection_name);
							setDeleteDialogOpen(false);
						}}
						color="error"
						variant="contained"
					>
						{t("connectionCard.deleteConnection")}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default ConnectionCard;
