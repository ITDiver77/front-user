import {
	Check as CheckIcon,
	ContentCopy as CopyIcon,
	Payment as PaymentIcon,
	Settings as SettingsIcon,
	Wifi as WifiIcon,
	WifiOff as WifiOffIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	IconButton,
	LinearProgress,
	Switch,
	Tooltip,
	Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
	cardVariants,
	copySuccessVariants,
	pulseVariants,
} from "../../styles/animations";
import type { Connection } from "../../types/connection";
import {
	formatDate,
	getConnectionStatus,
	getDaysRemaining,
	getStatusColor,
} from "../../utils/dateHelpers";

interface ConnectionCardProps {
	connection: Connection;
	onToggleAutoRenew: (connectionName: string, autoRenew: boolean) => void;
	onCopyConfig: (connectionString: string) => void;
	onExtend: (connectionName: string) => void;
	onChangeServer: (connectionName: string) => void;
	onToggleEnabled: (connectionName: string, enabled: boolean) => void;
	showStatusAnimation?: boolean;
	onAnimationComplete?: () => void;
}

const ConnectionCard = ({
	connection,
	onToggleAutoRenew,
	onCopyConfig,
	onExtend,
	onChangeServer,
	onToggleEnabled,
	showStatusAnimation = false,
	onAnimationComplete,
}: ConnectionCardProps) => {
	const [autoRenew, setAutoRenew] = useState(connection.auto_renew ?? false);
	const [enabled, setEnabled] = useState(connection.enabled);
	const [copySuccess, setCopySuccess] = useState(false);

	const status = getConnectionStatus(
		connection.enabled,
		connection.is_active,
		connection.paydate,
	);
	const daysRemaining = getDaysRemaining(connection.paydate);
	const statusColor = getStatusColor(status);

	const handleToggleAutoRenew = () => {
		const newValue = !autoRenew;
		setAutoRenew(newValue);
		onToggleAutoRenew(connection.connection_name, newValue);
	};

	const handleToggleEnabled = () => {
		const newValue = !enabled;
		setEnabled(newValue);
		onToggleEnabled(connection.connection_name, newValue);
	};

	const handleCopyConfig = () => {
		if (connection.connection_string) {
			navigator.clipboard.writeText(connection.connection_string).then(() => {
				setCopySuccess(true);
				setTimeout(() => setCopySuccess(false), 2000);
			});
		}
	};

	const isDeleted = connection.is_deleted === true;

	return (
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
							{isDeleted && (
								<Chip
									label="DELETED"
									color="error"
									size="small"
									variant="outlined"
								/>
							)}
							<motion.div whileHover={{ scale: 1.05 }}>
								<Chip
									label={status.toUpperCase()}
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
						Server: <strong>{connection.server_name || "Unknown"}</strong>
					</Typography>
					<Typography variant="body2">
						Price: <strong>${connection.price}</strong> per month
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Next payment: {formatDate(connection.paydate)}
					</Typography>
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
						Days remaining:{" "}
						{daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}
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
							Auto-renew:
						</Typography>
						<Switch
							checked={autoRenew}
							onChange={handleToggleAutoRenew}
							size="small"
							disabled={!enabled || isDeleted}
						/>
						<Typography variant="body2" color="text.secondary">
							{autoRenew ? "On" : "Off"}
						</Typography>
					</Box>
				</CardContent>

				<CardActions disableSpacing sx={{ px: 2, pb: 2 }}>
					<Tooltip title="Copy connection string">
						<span>
							<IconButton
								onClick={handleCopyConfig}
								size="small"
								aria-label="Copy connection string"
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
							Copied!
						</Typography>
					)}
					<Tooltip title="Extend / Pay">
						<span>
							<IconButton
								onClick={() => onExtend(connection.connection_name)}
								size="small"
								aria-label="Extend payment"
								disabled={isDeleted}
								component={motion.button}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								<PaymentIcon fontSize="small" />
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title="Change server">
						<span>
							<IconButton
								onClick={() => onChangeServer(connection.connection_name)}
								size="small"
								aria-label="Change server"
								disabled={isDeleted}
								component={motion.button}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								<SettingsIcon fontSize="small" />
							</IconButton>
						</span>
					</Tooltip>
					<Box sx={{ flexGrow: 1 }} />
					<Button
						variant="outlined"
						size="small"
						disabled={isDeleted}
						onClick={handleToggleEnabled}
						color={enabled ? "warning" : "success"}
						component={motion.button}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						{enabled ? "Disable" : "Enable"}
					</Button>
				</CardActions>
			</Card>
		</motion.div>
	);
};

export default ConnectionCard;
