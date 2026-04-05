import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useLanguage } from "../../i18n/LanguageContext";
import { connectionService } from "../../services/connectionService";
import { serverService } from "../../services/serverService";
import type { Server } from "../../types/server";
import { changeServerSchema } from "../../utils/validation";

interface ChangeServerModalProps {
	open: boolean;
	onClose: () => void;
	connectionName: string;
	currentServerName?: string;
	onSuccess: () => void;
}

type ChangeServerFormData = z.infer<typeof changeServerSchema>;

const ChangeServerModal = ({
	open,
	onClose,
	connectionName,
	currentServerName,
	onSuccess,
}: ChangeServerModalProps) => {
	const { t } = useLanguage();
	const [servers, setServers] = useState<Server[]>([]);
	const [loading, setLoading] = useState(false);
	const [serverLoading, setServerLoading] = useState(true);
	const [error, setError] = useState<string>("");

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ChangeServerFormData>({
		resolver: zodResolver(changeServerSchema),
		defaultValues: {
			newServerName: "",
		},
	});

	const fetchServers = useCallback(async () => {
		setServerLoading(true);
		try {
			const data = await serverService.getActiveServers();
			setServers(data);
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
		}
	}, [open, reset, fetchServers]);

	const onSubmit = async (data: ChangeServerFormData) => {
		setLoading(true);
		setError("");
		try {
			await connectionService.changeServer(connectionName, data.newServerName);
			onSuccess();
			onClose();
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : t("modals.failedToChangeServer");
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				{t("modals.changeServer")} {connectionName}
			</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<Typography variant="body2" sx={{ mb: 2 }}>
					{t("modals.currentServer")}:{" "}
					<strong>{currentServerName || t("modals.unknown")}</strong>
				</Typography>
				<form id="change-server-form" onSubmit={handleSubmit(onSubmit)}>
					<FormControl fullWidth margin="normal" error={!!errors.newServerName}>
						<InputLabel id="server-label">{t("modals.newServer")}</InputLabel>
						<Select
							labelId="server-label"
							label={t("modals.newServer")}
							{...register("newServerName")}
							disabled={serverLoading}
						>
							{serverLoading && (
								<MenuItem value="">{t("common.loading")}</MenuItem>
							)}
							{servers
								.filter((server) => server.name !== currentServerName)
								.map((server) => (
									<MenuItem key={server.id} value={server.name}>
										{t(`servers.${server.name}`)} ({server.region})
									</MenuItem>
								))}
						</Select>
						{errors.newServerName && (
							<Typography variant="caption" color="error">
								{errors.newServerName.message}
							</Typography>
						)}
					</FormControl>
				</form>
				<Typography variant="caption" color="textSecondary">
					{t("modals.changeServerWarning")}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					{t("common.cancel")}
				</Button>
				<Button
					type="submit"
					form="change-server-form"
					variant="contained"
					disabled={loading || serverLoading}
				>
					{loading ? <CircularProgress size={24} /> : t("modals.changeServer")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ChangeServerModal;
