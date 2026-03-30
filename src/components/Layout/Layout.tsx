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
import { ThemeSelector } from "../common/ThemeSelector";

const drawerWidth = 240;

const menuItems = [
	{ text: "Dashboard", path: "/", icon: <DashboardIcon /> },
	{ text: "Payment History", path: "/payment-history", icon: <PaymentIcon /> },
	{ text: "Instructions", path: "/instructions", icon: <HelpIcon /> },
	{ text: "Profile", path: "/profile", icon: <PersonIcon /> },
	{ text: "Support", path: "/support", icon: <ChatIcon /> },
];

const Layout = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [drawerOpen, setDrawerOpen] = useState(!isMobile);
	const [bottomNavValue, setBottomNavValue] = useState(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { isTelegram, setHeaderColor, setBackgroundColor } =
		useTelegramWebApp();

	useEffect(() => {
		if (isTelegram) {
			setHeaderColor(theme.palette.primary.main);
			setBackgroundColor(theme.palette.background.default);
		}
	}, [isTelegram, theme, setHeaderColor, setBackgroundColor]);

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
									<ListItemIcon>{item.icon}</ListItemIcon>
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
								<ListItemIcon>{item.icon}</ListItemIcon>
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
						<ListItemText primary="Logout" />
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
						VPN User Panel
					</Typography>
					<ThemeSelector />
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
						<MenuItem onClick={() => handleNavigation("/profile", 3)}>
							<ListItemIcon>
								<PersonIcon fontSize="small" />
							</ListItemIcon>
							Profile
						</MenuItem>
						<MenuItem onClick={handleLogout}>
							<ListItemIcon>
								<LogoutIcon fontSize="small" />
							</ListItemIcon>
							Logout
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
								[`& .MuiDrawer-paper`]: {
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
						onChange={(event, newValue) => {
							setBottomNavValue(newValue);
							handleNavigation(menuItems[newValue].path, newValue);
						}}
					>
						{menuItems.map((item) => (
							<BottomNavigationAction
								key={item.text}
								label={item.text}
								icon={item.icon}
							/>
						))}
					</BottomNavigation>
				</Paper>
			)}
			{isMobile && <Box sx={{ height: 56 }} />}
			<Box
				component="footer"
				sx={{ py: 2, px: 3, backgroundColor: "grey.100", textAlign: "center" }}
			>
				<Typography variant="body2" color="textSecondary">
					© {new Date().getFullYear()} VPN Service
				</Typography>
			</Box>
		</Box>
	);
};

export default Layout;
