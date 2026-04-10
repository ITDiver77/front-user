import {
	Chat as ChatIcon,
	ChevronLeft as ChevronLeftIcon,
	ChevronRight as ChevronRightIcon,
	Dashboard as DashboardIcon,
	Help as HelpIcon,
	ExitToApp as LogoutIcon,
	Menu as MenuIcon,
	Payment as PaymentIcon,
	Person as PersonIcon,
} from "@mui/icons-material";
import {
	AppBar,
	Avatar,
	Badge,
	BottomNavigation,
	BottomNavigationAction,
	Box,
	Button,
	CssBaseline,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Toolbar,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTelegramWebApp } from "../../hooks/useTelegramWebApp";
import { useLanguage } from "../../i18n";
import { supportService } from "../../services/supportService";
import { ThemeSelector } from "../common/ThemeSelector";

const drawerWidth = 240;

const Layout = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [drawerOpen, setDrawerOpen] = useState(!isMobile);
	const [bottomNavValue, setBottomNavValue] = useState(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { isTelegram, setHeaderColor, setBackgroundColor } =
		useTelegramWebApp();
	const { t, language, setLanguage } = useLanguage();

	const menuItems = [
		{ text: t("nav.dashboard"), path: "/", icon: <DashboardIcon /> },
		{
			text: t("nav.paymentHistory"),
			path: "/payment-history",
			icon: <PaymentIcon />,
		},
		{
			text: t("nav.instructions"),
			path: "/instructions",
			icon: <HelpIcon />,
		},
		{ text: t("nav.profile"), path: "/profile", icon: <PersonIcon /> },
		{ text: t("nav.support"), path: "/support", icon: <ChatIcon /> },
	];

	useEffect(() => {
		if (isTelegram) {
			setHeaderColor(theme.palette.primary.main);
			setBackgroundColor(theme.palette.background.default);
		}
	}, [isTelegram, theme, setHeaderColor, setBackgroundColor]);

	useEffect(() => {
		const fetchUnreadCount = async () => {
			try {
				const count = await supportService.getUnreadCount();
				setUnreadCount(count);
			} catch (err) {
				console.error("Failed to fetch unread count:", err);
			}
		};

		fetchUnreadCount();
		const interval = setInterval(fetchUnreadCount, 30000);

		const handleSupportMessagesRead = () => {
			fetchUnreadCount();
		};
		window.addEventListener("support-messages-read", handleSupportMessagesRead);

		return () => {
			clearInterval(interval);
			window.removeEventListener(
				"support-messages-read",
				handleSupportMessagesRead,
			);
		};
	}, []);

	const handleDrawerToggle = () => {
		setDrawerOpen(!drawerOpen);
	};

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
		handleMenuClose();
	};

	const handleNavigation = (path: string, index: number) => {
		navigate(path);
		if (isMobile) {
			setBottomNavValue(index);
		}
	};

	const getMenuIcon = (item: (typeof menuItems)[number]) => {
		let badgeContent = 0;
		let showBadge = false;

		if (item.path === "/profile" && !user?.telegram_verified) {
			showBadge = true;
			badgeContent = 1;
		} else if (item.path === "/support" && unreadCount > 0) {
			showBadge = true;
			badgeContent = unreadCount;
		}

		if (showBadge) {
			return (
				<Badge badgeContent={badgeContent} color="error">
					{item.icon}
				</Badge>
			);
		}
		return item.icon;
	};

	const drawer = (
		<Box>
			<Toolbar />
			<Divider />
			<List>
				{menuItems.map((item, index) => (
					<ListItem key={item.text} disablePadding>
						{!drawerOpen ? (
							<Tooltip title={item.text} placement="right">
								<ListItemButton
									selected={location.pathname === item.path}
									onClick={() => handleNavigation(item.path, index)}
									component={motion.button}
									whileHover={{ x: 4 }}
									whileTap={{ scale: 0.98 }}
									sx={{
										"&.Mui-selected": {
											bgcolor: "action.selected",
											borderRight: "3px solid",
											borderColor: "primary.main",
										},
									}}
								>
									<ListItemIcon>{getMenuIcon(item)}</ListItemIcon>
								</ListItemButton>
							</Tooltip>
						) : (
							<ListItemButton
								selected={location.pathname === item.path}
								onClick={() => handleNavigation(item.path, index)}
								component={motion.button}
								whileHover={{ x: 4 }}
								whileTap={{ scale: 0.98 }}
								sx={{
									"&.Mui-selected": {
										bgcolor: "action.selected",
										borderRight: "3px solid",
										borderColor: "primary.main",
									},
								}}
							>
								<ListItemIcon>{getMenuIcon(item)}</ListItemIcon>
								<ListItemText primary={item.text} />
							</ListItemButton>
						)}
					</ListItem>
				))}
				<Divider />
				<ListItem disablePadding>
					<ListItemButton onClick={handleLogout}>
						<ListItemIcon>
							<LogoutIcon />
						</ListItemIcon>
						<ListItemText primary={t("nav.logout")} />
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);

	if (isTelegram) {
		return (
			<Box
				sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
			>
				<CssBaseline />
				<Box
					component="main"
					sx={{
						flexGrow: 1,
						p: 2,
						pb: 8,
					}}
				>
					<AnimatePresence mode="wait">
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.25 }}
						>
							<Outlet />
						</motion.div>
					</AnimatePresence>
				</Box>
			</Box>
		);
	}

	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<CssBaseline />
			<AppBar
				position="fixed"
				sx={{
					zIndex: theme.zIndex.drawer + 1,
				}}
			>
				<Toolbar>
					{!isMobile && (
						<IconButton
							color="inherit"
							aria-label="toggle drawer"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{ mr: 2 }}
							component={motion.button}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							{drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
						</IconButton>
					)}
					{isMobile && (
						<IconButton
							color="inherit"
							aria-label="open drawer"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{ mr: 2 }}
							component={motion.button}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<MenuIcon />
						</IconButton>
					)}
					<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
						{t("app.title")}
					</Typography>
					<ThemeSelector />
					<Button
						color="inherit"
						onClick={() => setLanguage(language === "ru" ? "en" : "ru")}
						sx={{ minWidth: "auto", px: 1 }}
					>
						{language === "ru" ? "EN" : "RU"}
					</Button>
					<IconButton onClick={handleMenuOpen} color="inherit">
						<Badge
							badgeContent="!"
							color="error"
							anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
							invisible={user?.telegram_verified}
						>
							<Avatar
								sx={{ width: 32, height: 32 }}
								component={motion.div}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
							>
								{user?.username?.charAt(0).toUpperCase() || "U"}
							</Avatar>
						</Badge>
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "right",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
						PaperProps={{
							component: motion.div,
							initial: { opacity: 0, y: -10 },
							animate: { opacity: 1, y: 0 },
							exit: { opacity: 0, y: -10 },
						}}
					>
						<MenuItem disabled>{user?.username}</MenuItem>
						<Divider />
						<MenuItem onClick={() => handleNavigation("/profile", 0)}>
							<ListItemIcon>
								<PersonIcon fontSize="small" />
							</ListItemIcon>
							{t("nav.profile")}
						</MenuItem>
						<MenuItem onClick={handleLogout}>
							<ListItemIcon>
								<LogoutIcon fontSize="small" />
							</ListItemIcon>
							{t("nav.logout")}
						</MenuItem>
					</Menu>
				</Toolbar>
			</AppBar>
			<Box sx={{ display: "flex", flexGrow: 1 }}>
				{!isMobile ? (
					<>
						<Drawer
							variant="permanent"
							open={drawerOpen}
							sx={{
								width: drawerOpen ? drawerWidth : theme.spacing(7),
								flexShrink: 0,
								"& .MuiDrawer-paper": {
									width: drawerOpen ? drawerWidth : theme.spacing(7),
									boxSizing: "border-box",
									transition: theme.transitions.create("width", {
										easing: theme.transitions.easing.sharp,
										duration: theme.transitions.duration.enteringScreen,
									}),
								},
							}}
						>
							{drawer}
						</Drawer>
						<Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
							<AnimatePresence mode="wait">
								<motion.div
									key={location.pathname}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.25 }}
								>
									<Outlet />
								</motion.div>
							</AnimatePresence>
						</Box>
					</>
				) : (
					<>
						<Drawer
							variant="temporary"
							open={drawerOpen}
							onClose={handleDrawerToggle}
							ModalProps={{
								keepMounted: true,
							}}
							sx={{
								"& .MuiDrawer-paper": {
									boxSizing: "border-box",
									width: drawerWidth,
								},
							}}
						>
							{drawer}
						</Drawer>
						<Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
							<AnimatePresence mode="wait">
								<motion.div
									key={location.pathname}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.25 }}
								>
									<Outlet />
								</motion.div>
							</AnimatePresence>
						</Box>
					</>
				)}
			</Box>
			{isMobile && (
				<Paper
					sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
					elevation={3}
				>
					<BottomNavigation
						showLabels
						value={bottomNavValue}
						onChange={(_event, newValue) => {
							setBottomNavValue(newValue);
							handleNavigation(menuItems[newValue].path, newValue);
						}}
					>
						{menuItems.map((item) => (
							<BottomNavigationAction
								key={item.text}
								label={item.text}
								icon={getMenuIcon(item)}
							/>
						))}
					</BottomNavigation>
				</Paper>
			)}
			{isMobile && <Box sx={{ height: 56 }} />}
			<Box
				component="footer"
				sx={{
					py: 2,
					px: 3,
					textAlign: "center",
					backgroundColor: theme.palette.background.default,
					color: theme.palette.text.secondary,
					borderTop: `1px solid ${theme.palette.divider}`,
				}}
			>
				<Typography variant="body2" color="inherit">
					{t("app.footer")}
				</Typography>
			</Box>
		</Box>
	);
};

export default Layout;
