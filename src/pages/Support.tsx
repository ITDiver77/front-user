import {
	Add as AddIcon,
	ArrowBack as ArrowBackIcon,
	Chat as ChatIcon,
	Close as CloseIcon,
	Delete as DeleteIcon,
	Send as SendIcon,
	SupportAgent as SupportAgentIcon,
	ViewList as ViewListIcon,
	ViewModule as ViewModuleIcon,
} from "@mui/icons-material";
import {
	Alert,
	Avatar,
	Badge,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Paper,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { supportService } from "../services/supportService";
import { pageVariants, staggerItem } from "../styles/animations";
import type {
	ConversationListItem,
	SupportConversation,
	SupportMessage,
} from "../types/support";

// Chat UI Variant type
type ChatVariant = "telegram" | "cards";

// Component for message bubble - Variant A (Telegram-like)
const TelegramBubble = ({
	message,
	isUser,
}: {
	message: SupportMessage;
	isUser: boolean;
}) => {
	const theme = useTheme();
	const isFromSupport = message.is_from_admin;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.2 }}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: isUser ? "flex-end" : "flex-start",
					mb: 1.5,
				}}
			>
				<Box
					sx={{
						maxWidth: "75%",
						px: 2,
						py: 1.25,
						borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
						backgroundColor: isUser
							? theme.palette.mode === "dark"
								? "rgba(25, 118, 210, 0.9)"
								: theme.palette.primary.main
							: isFromSupport
								? theme.palette.success.main
								: theme.palette.mode === "dark"
									? "rgba(255, 255, 255, 0.1)"
									: theme.palette.grey[100],
						color:
							isUser || isFromSupport
								? "#fff"
								: theme.palette.mode === "dark"
									? theme.palette.text.primary
									: theme.palette.text.primary,
						boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
						position: "relative",
					}}
				>
					<Typography variant="body2" sx={{ wordBreak: "break-word" }}>
						{message.message}
					</Typography>
					<Typography
						variant="caption"
						sx={{
							display: "block",
							mt: 0.5,
							opacity: 0.7,
							textAlign: isUser ? "right" : "left",
							fontSize: "10px",
						}}
					>
						{new Date(message.created_at).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Typography>
				</Box>
			</Box>
		</motion.div>
	);
};

// Component for message bubble - Variant B (Modern Cards)
const CardBubble = ({ message }: { message: SupportMessage }) => {
	const theme = useTheme();
	const isFromSupport = message.is_from_admin;

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.25 }}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
					mb: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
					<Avatar
						sx={{
							width: 24,
							height: 24,
							mr: 1,
							bgcolor: isFromSupport ? "success.main" : "primary.main",
						}}
					>
						{isFromSupport ? (
							<SupportAgentIcon sx={{ fontSize: 14 }} />
						) : (
							<ChatIcon sx={{ fontSize: 14 }} />
						)}
					</Avatar>
					<Typography variant="caption" fontWeight={600} color="text.secondary">
						{isFromSupport ? "Support" : "You"}
					</Typography>
					<Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
						{new Date(message.created_at).toLocaleString()}
					</Typography>
				</Box>
				<Paper
					elevation={0}
					sx={{
						px: 2,
						py: 1.5,
						borderRadius: 2,
						backgroundColor: isFromSupport
							? theme.palette.mode === "dark"
								? "rgba(46, 125, 50, 0.15)"
								: "rgba(46, 125, 50, 0.08)"
							: theme.palette.mode === "dark"
								? "rgba(25, 118, 210, 0.15)"
								: "rgba(25, 118, 210, 0.08)",
						border: "1px solid",
						borderColor: isFromSupport ? "success.light" : "primary.light",
						maxWidth: "85%",
					}}
				>
					<Typography variant="body2" sx={{ wordBreak: "break-word" }}>
						{message.message}
					</Typography>
				</Paper>
			</Box>
		</motion.div>
	);
};

// New Conversation Dialog
interface NewConversationDialogProps {
	open: boolean;
	onClose: () => void;
	onCreated: (conversation: SupportConversation) => void;
}

const NewConversationDialog = ({
	open,
	onClose,
	onCreated,
}: NewConversationDialogProps) => {
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async () => {
		if (!message.trim()) return;

		setLoading(true);
		setError("");
		try {
			const conversation = await supportService.createConversation(
				message.trim(),
			);
			onCreated(conversation);
			setMessage("");
			onClose();
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to create conversation";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Start New Conversation</DialogTitle>
			<DialogContent>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					Describe your issue or question, and our support team will get back to
					you.
				</Typography>
				<TextField
					autoFocus
					multiline
					rows={4}
					fullWidth
					placeholder="Type your message here..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={loading || !message.trim()}
					startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
				>
					Send Message
				</Button>
			</DialogActions>
		</Dialog>
	);
};

// Main Support Page
const Support = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	// State
	const [conversations, setConversations] = useState<ConversationListItem[]>(
		[],
	);
	const [selectedConversation, setSelectedConversation] =
		useState<SupportConversation | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [sending, setSending] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [showNewDialog, setShowNewDialog] = useState(false);
	const [chatVariant, setChatVariant] = useState<ChatVariant>("telegram");

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Fetch conversations
	const fetchConversations = async () => {
		try {
			const data = await supportService.getConversations();
			setConversations(data);
		} catch (err) {
			console.error("Failed to fetch conversations:", err);
		}
	};

	// Fetch initial data
	useEffect(() => {
		const init = async () => {
			setLoading(true);
			setError("");
			try {
				await fetchConversations();
			} catch (err: any) {
				const errorMessage = err?.message || "Failed to load conversations";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};
		init();
	}, []);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		if (selectedConversation?.messages) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [selectedConversation?.messages]);

	// Select conversation
	const handleSelectConversation = async (id: number) => {
		try {
			const conversation = await supportService.getConversation(id);
			setSelectedConversation(conversation);
		} catch (err: any) {
			console.error("Failed to load conversation:", err);
			setError(err?.message || "Failed to load conversation");
		}
	};

	// Send message
	const handleSendMessage = async () => {
		if (!newMessage.trim() || !selectedConversation) return;

		setSending(true);
		try {
			const updated = await supportService.sendMessage(
				selectedConversation.id,
				newMessage.trim(),
			);
			setSelectedConversation(updated);
			setNewMessage("");
			// Refresh conversation list
			fetchConversations();
		} catch (err: any) {
			console.error("Failed to send message:", err);
			setError(err?.message || "Failed to send message");
		} finally {
			setSending(false);
		}
	};

	// Close conversation
	const handleCloseConversation = async () => {
		if (!selectedConversation) return;

		try {
			const updated = await supportService.closeConversation(
				selectedConversation.id,
			);
			setSelectedConversation(updated);
			fetchConversations();
		} catch (err) {
			console.error("Failed to close conversation:", err);
		}
	};

	// Delete conversation
	const handleDeleteConversation = async () => {
		if (!selectedConversation) return;

		try {
			await supportService.deleteConversation(selectedConversation.id);
			setSelectedConversation(null);
			fetchConversations();
		} catch (err) {
			console.error("Failed to delete conversation:", err);
		}
	};

	// Handle new conversation created
	const handleConversationCreated = (conversation: SupportConversation) => {
		// Convert SupportConversation to ConversationListItem for the list
		const listItem: ConversationListItem = {
			id: conversation.id,
			user_id: conversation.user_id,
			status: conversation.status,
			created_at: conversation.created_at,
			updated_at: conversation.updated_at,
			last_message: conversation.messages[0]?.message || null,
			last_message_at: conversation.messages[0]?.created_at || null,
		};
		setConversations((prev) => [listItem, ...prev]);
		setSelectedConversation(conversation);
	};

	// Handle key press in message input
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Format date for conversation list
	const formatDate = (dateString: string | null) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) {
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (days === 1) {
			return "Yesterday";
		} else if (days < 7) {
			return date.toLocaleDateString([], { weekday: "short" });
		} else {
			return date.toLocaleDateString([], { month: "short", day: "numeric" });
		}
	};

	// Render message bubbles based on variant
	const renderMessage = (message: SupportMessage, isUser: boolean) => {
		if (chatVariant === "telegram") {
			return (
				<TelegramBubble key={message.id} message={message} isUser={isUser} />
			);
		}
		return <CardBubble key={message.id} message={message} />;
	};

	// Loading state
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
		<motion.div variants={pageVariants} initial="initial" animate="animate">
			<Box
				sx={{
					height: "calc(100vh - 100px)",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
						flexWrap: "wrap",
						gap: 1,
					}}
				>
					<Typography variant="h5" fontWeight={600}>
						Support Chat
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<ToggleButtonGroup
							value={chatVariant}
							exclusive
							onChange={(_, value) => value && setChatVariant(value)}
							size="small"
						>
							<ToggleButton value="telegram">
								<ViewListIcon sx={{ mr: 0.5, fontSize: 18 }} />
								Telegram
							</ToggleButton>
							<ToggleButton value="cards">
								<ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />
								Cards
							</ToggleButton>
						</ToggleButtonGroup>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => setShowNewDialog(true)}
							size="small"
						>
							New Chat
						</Button>
					</Box>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{/* Main Content */}
				<Paper
					elevation={0}
					sx={{
						flex: 1,
						display: "flex",
						overflow: "hidden",
						borderRadius: 3,
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
					}}
				>
					{/* Conversations Sidebar */}
					{(!isMobile || !selectedConversation) && (
						<Box
							sx={{
								width: isMobile ? "100%" : 320,
								borderRight: !isMobile ? "1px solid" : "none",
								borderColor: "divider",
								display: "flex",
								flexDirection: "column",
								bgcolor: "grey.50",
							}}
						>
							<Box
								sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
							>
								<Typography variant="subtitle2" color="text.secondary">
									Your Conversations
								</Typography>
							</Box>

							{conversations.length === 0 ? (
								<EmptyState
									icon={<ChatIcon />}
									title="No conversations yet"
									description="Start a new conversation to get help from our support team"
									action={
										<Button
											variant="outlined"
											size="small"
											startIcon={<AddIcon />}
											onClick={() => setShowNewDialog(true)}
										>
											Start Chat
										</Button>
									}
								/>
							) : (
								<List sx={{ flex: 1, overflow: "auto", py: 1 }}>
									<AnimatePresence>
										{conversations.map((conv) => (
											<motion.div
												key={conv.id}
												variants={staggerItem}
												initial="initial"
												animate="animate"
											>
												<ListItem disablePadding>
													<ListItemButton
														selected={selectedConversation?.id === conv.id}
														onClick={() => handleSelectConversation(conv.id)}
														sx={{
															mx: 1,
															borderRadius: 2,
															mb: 0.5,
															"&.Mui-selected": {
																bgcolor: "primary.light",
																"&:hover": {
																	bgcolor: "primary.light",
																},
															},
														}}
													>
														<ListItemAvatar>
															<Badge
																color="primary"
																variant="dot"
																invisible={conv.status === "closed"}
															>
																<Avatar sx={{ bgcolor: "success.main" }}>
																	<SupportAgentIcon />
																</Avatar>
															</Badge>
														</ListItemAvatar>
														<ListItemText
															primary={
																<Box
																	sx={{
																		display: "flex",
																		alignItems: "center",
																		gap: 1,
																	}}
																>
																	<Typography
																		variant="body2"
																		fontWeight={600}
																		noWrap
																		sx={{ maxWidth: 140 }}
																	>
																		Conversation #{conv.id}
																	</Typography>
																	<Chip
																		label={conv.status}
																		size="small"
																		color={
																			conv.status === "open"
																				? "success"
																				: "default"
																		}
																		sx={{ height: 20, fontSize: "10px" }}
																	/>
																</Box>
															}
															secondary={
																<Typography
																	variant="caption"
																	color="text.secondary"
																	noWrap
																	sx={{ display: "block" }}
																>
																	{conv.last_message || "No messages yet"}
																</Typography>
															}
														/>
														<Typography variant="caption" color="text.disabled">
															{formatDate(conv.last_message_at)}
														</Typography>
													</ListItemButton>
												</ListItem>
											</motion.div>
										))}
									</AnimatePresence>
								</List>
							)}
						</Box>
					)}

					{/* Chat Area */}
					{(!isMobile || selectedConversation) && (
						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								minWidth: 0,
							}}
						>
							{selectedConversation ? (
								<>
									{/* Chat Header */}
									<Box
										sx={{
											p: 2,
											borderBottom: "1px solid",
											borderColor: "divider",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											bgcolor: "background.paper",
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											{isMobile && (
												<IconButton
													onClick={() => setSelectedConversation(null)}
													size="small"
												>
													<ArrowBackIcon />
												</IconButton>
											)}
											<Avatar sx={{ bgcolor: "success.main", mr: 1 }}>
												<SupportAgentIcon />
											</Avatar>
											<Box>
												<Typography variant="subtitle1" fontWeight={600}>
													Support #{selectedConversation.id}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{selectedConversation.status === "open"
														? "Active"
														: "Closed"}
												</Typography>
											</Box>
										</Box>
										<Box sx={{ display: "flex", gap: 1 }}>
											<Button
												variant="outlined"
												color="error"
												size="small"
												startIcon={<DeleteIcon />}
												onClick={handleDeleteConversation}
											>
												Delete
											</Button>
											{selectedConversation.status === "open" && (
												<Button
													variant="outlined"
													color="warning"
													size="small"
													startIcon={<CloseIcon />}
													onClick={handleCloseConversation}
												>
													Close
												</Button>
											)}
										</Box>
									</Box>

									{/* Messages */}
									<Box
										sx={{
											flex: 1,
											overflow: "auto",
											p: 2,
											bgcolor:
												chatVariant === "telegram"
													? theme.palette.mode === "dark"
														? "grey.900"
														: "#e8f0fe"
													: "background.default",
										}}
									>
										{selectedConversation.messages.map((message) =>
											renderMessage(message, !message.is_from_admin),
										)}
										<div ref={messagesEndRef} />
									</Box>

									{/* Message Input */}
									{selectedConversation.status === "open" ? (
										<Box
											sx={{
												p: 2,
												borderTop: "1px solid",
												borderColor: "divider",
												bgcolor: "background.paper",
											}}
										>
											<Box sx={{ display: "flex", gap: 1 }}>
												<TextField
													fullWidth
													size="small"
													placeholder="Type your message..."
													value={newMessage}
													onChange={(e) => setNewMessage(e.target.value)}
													onKeyDown={handleKeyDown}
													multiline
													maxRows={4}
													disabled={sending}
												/>
												<IconButton
													color="primary"
													onClick={handleSendMessage}
													disabled={sending || !newMessage.trim()}
													sx={{
														bgcolor: "primary.main",
														color: "#fff",
														"&:hover": {
															bgcolor: "primary.dark",
														},
														"&.Mui-disabled": {
															bgcolor: "grey.300",
															color: "grey.500",
														},
													}}
												>
													{sending ? (
														<CircularProgress size={24} color="inherit" />
													) : (
														<SendIcon />
													)}
												</IconButton>
											</Box>
										</Box>
									) : (
										<Box
											sx={{
												p: 2,
												borderTop: "1px solid",
												borderColor: "divider",
												bgcolor: "grey.50",
												textAlign: "center",
											}}
										>
											<Typography variant="body2" color="text.secondary">
												This conversation has been closed.{" "}
												<Button
													size="small"
													onClick={() => setShowNewDialog(true)}
												>
													Start new
												</Button>
											</Typography>
										</Box>
									)}
								</>
							) : (
								<EmptyState
									icon={<ChatIcon sx={{ fontSize: 40 }} />}
									title="Select a conversation"
									description="Choose from your existing conversations or start a new one"
									action={
										<Button
											variant="contained"
											startIcon={<AddIcon />}
											onClick={() => setShowNewDialog(true)}
										>
											New Conversation
										</Button>
									}
								/>
							)}
						</Box>
					)}
				</Paper>

				{/* New Conversation Dialog */}
				<NewConversationDialog
					open={showNewDialog}
					onClose={() => setShowNewDialog(false)}
					onCreated={handleConversationCreated}
				/>
			</Box>
		</motion.div>
	);
};

export default Support;
