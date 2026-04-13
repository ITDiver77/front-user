import { Box, CircularProgress } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ConnectionStatusProvider } from "./contexts/ConnectionStatusContext";
import { LanguageProvider } from "./i18n";
import { pageVariants } from "./styles/animations";

// Layout
const Layout = lazy(() => import("./components/Layout/Layout"));
const PublicLayout = lazy(() => import("./components/Layout/PublicLayout"));

// Pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const Instructions = lazy(() => import("./pages/Instructions"));
const Profile = lazy(() => import("./pages/Profile"));
const Support = lazy(() => import("./pages/Support"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
	<motion.div
		initial="initial"
		animate="animate"
		exit="exit"
		variants={pageVariants}
		style={{ width: "100%", height: "100%" }}
	>
		{children}
	</motion.div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="100vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

function AppRoutes() {
	const location = useLocation();

	return (
		<AnimatePresence mode="wait">
			<Suspense
				fallback={
					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						minHeight="100vh"
					>
						<CircularProgress />
					</Box>
				}
			>
				<Routes location={location} key={location.pathname}>
					<Route
						path="/login"
						element={
							<PageWrapper>
								<Login />
							</PageWrapper>
						}
					/>
					<Route
						path="/register"
						element={
							<PageWrapper>
								<Register />
							</PageWrapper>
						}
					/>
					<Route
						path="/forgot-password"
						element={
							<PageWrapper>
								<ForgotPassword />
							</PageWrapper>
						}
					/>
					<Route
						path="/reset-password"
						element={
							<PageWrapper>
								<ForgotPassword />
							</PageWrapper>
						}
					/>
					<Route
						path="/auth/callback"
						element={
							<PageWrapper>
								<AuthCallback />
							</PageWrapper>
						}
					/>
					{/* Public instructions route — accessible without login */}
					<Route
						path="/instructions"
						element={<PublicLayout />}
					>
						<Route
							index
							element={
								<PageWrapper>
									<Instructions />
								</PageWrapper>
							}
						/>
					</Route>
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Layout />
							</PrivateRoute>
						}
					>
						<Route
							index
							element={
								<PageWrapper>
									<Dashboard />
								</PageWrapper>
							}
						/>
						<Route
							path="payment-history"
							element={
								<PageWrapper>
									<PaymentHistory />
								</PageWrapper>
							}
						/>
						<Route
							path="instructions"
							element={
								<PageWrapper>
									<Instructions />
								</PageWrapper>
							}
						/>
						<Route
							path="profile"
							element={
								<PageWrapper>
									<Profile />
								</PageWrapper>
							}
						/>
						<Route
							path="support"
							element={
								<PageWrapper>
									<Support />
								</PageWrapper>
							}
						/>
					</Route>
				</Routes>
			</Suspense>
		</AnimatePresence>
	);
}

function AppContent() {
	const { isAuthenticated, loading } = useAuth();

	return (
		<ConnectionStatusProvider enabled={isAuthenticated && !loading}>
			<AppRoutes />
		</ConnectionStatusProvider>
	);
}

function App() {
	return (
		<LanguageProvider>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</LanguageProvider>
	);
}

export default App;
