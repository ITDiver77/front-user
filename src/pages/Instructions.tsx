import {
	AddCircle as AddIcon,
	Computer as ComputerIcon,
	Help as HelpIcon,
	KeyboardArrowDown,
	Language as LanguageIcon,
	Palette as PaletteIcon,
	PersonAdd as PersonAddIcon,
	PhoneAndroid as PhoneIcon,
	Security as SecurityIcon,
	Settings as SettingsIcon,
	Storage as StorageIcon,
} from "@mui/icons-material";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Chip,
	Divider,
	Paper,
	Tab,
	Tabs,
	Typography,
	useMediaQuery,
	useTheme as useMuiTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const ScreenshotPlaceholder = ({
	label,
	description,
}: { label: string; description: string }) => (
	<Box
		sx={{
			width: "100%",
			maxWidth: 600,
			height: 300,
			mx: "auto",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			bgcolor: "action.hover",
			borderRadius: 2,
			border: "2px dashed",
			borderColor: "divider",
			my: 2,
		}}
	>
		<Typography variant="h6" color="text.secondary" gutterBottom>
			📷 {label}
		</Typography>
		<Typography variant="body2" color="text.secondary">
			{description}
		</Typography>
	</Box>
);

interface StepProps {
	number: number;
	title: string;
	description: string;
	screenshotLabel: string;
	screenshotDesc: string;
}

const StepCard = ({ number, title, description, screenshotLabel, screenshotDesc }: StepProps) => (
	<Box
		sx={{ mb: 4 }}
		component={motion.div}
		initial={{ opacity: 0, x: -20 }}
		whileInView={{ opacity: 1, x: 0 }}
		viewport={{ once: true, margin: "-50px" }}
		transition={{ duration: 0.4, delay: number * 0.05 }}
	>
		<Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 1 }}>
			<Chip
				label={number}
				color="primary"
				size="small"
				sx={{ fontWeight: 700, minWidth: 32, height: 28 }}
			/>
			<Box>
				<Typography variant="subtitle1" fontWeight={600} gutterBottom>
					{title}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
					{description}
				</Typography>
			</Box>
		</Box>
		<ScreenshotPlaceholder label={screenshotLabel} description={screenshotDesc} />
	</Box>
);

const SectionTitle = ({
	icon,
	title,
	id,
}: { icon: React.ReactNode; title: string; id: string }) => (
	<Box
		id={id}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 1.5,
			mb: 2,
			pt: 2,
			scrollMarginTop: 80,
		}}
		component={motion.div}
		initial={{ opacity: 0, y: 10 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true }}
		transition={{ duration: 0.3 }}
	>
		{icon}
		<Typography variant="h5" fontWeight={700}>
			{title}
		</Typography>
	</Box>
);

const Instructions = () => {
	const { t } = useLanguage();
	const muiTheme = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
	const [vpnTab, setVpnTab] = useState(0);

	const tocItems = [
		{ id: "registration", label: t("instructions.registration.title") },
		{ id: "vpn-setup", label: t("instructions.vpnSetup.title") },
		{ id: "theme", label: t("instructions.theme.title") },
		{ id: "server", label: t("instructions.server.title") },
		{ id: "connections", label: t("instructions.connections.title") },
		{ id: "faq", label: t("instructions.faq") },
	];

	const vpnTabs = [
		{ key: "windows", icon: <ComputerIcon fontSize="small" /> },
		{ key: "android", icon: <PhoneIcon fontSize="small" /> },
		{ key: "ios", icon: <PhoneIcon fontSize="small" /> },
		{ key: "linux", icon: <StorageIcon fontSize="small" /> },
	];

	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<Box>
			{/* Page Title */}
			<Typography
				variant="h4"
				fontWeight={700}
				sx={{ mb: 1 }}
				component={motion.h1}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				{t("instructions.title")}
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				sx={{ mb: 4 }}
				component={motion.p}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.1 }}
			>
				{t("instructions.subtitle")}
			</Typography>

			{/* Table of Contents */}
			<Paper
				sx={{ p: { xs: 2, md: 3 }, mb: 4 }}
				component={motion.div}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.2 }}
			>
				<Typography variant="h6" fontWeight={600} gutterBottom>
					{t("instructions.toc")}
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						gap: 1,
					}}
				>
					{tocItems.map((item) => (
						<Button
							key={item.id}
							size="small"
							variant="outlined"
							onClick={() => scrollTo(item.id)}
							sx={{ textTransform: "none", borderRadius: 2 }}
							component={motion.button}
							whileHover={{ scale: 1.04 }}
							whileTap={{ scale: 0.96 }}
						>
							{item.label}
						</Button>
					))}
				</Box>
			</Paper>

			{/* Section 1: Registration Guide */}
			<Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
				<SectionTitle
					icon={<PersonAddIcon color="primary" />}
					title={t("instructions.registration.title")}
					id="registration"
				/>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					{t("instructions.registration.description")}
				</Typography>

				<StepCard
					number={1}
					title={t("instructions.registration.step1Title")}
					description={t("instructions.registration.step1Desc")}
					screenshotLabel={t("instructions.registration.step1Screenshot")}
					screenshotDesc={t("instructions.registration.step1Desc")}
				/>
				<StepCard
					number={2}
					title={t("instructions.registration.step2Title")}
					description={t("instructions.registration.step2Desc")}
					screenshotLabel={t("instructions.registration.step2Screenshot")}
					screenshotDesc={t("instructions.registration.step2Desc")}
				/>
				<StepCard
					number={3}
					title={t("instructions.registration.step3Title")}
					description={t("instructions.registration.step3Desc")}
					screenshotLabel={t("instructions.registration.step3Screenshot")}
					screenshotDesc={t("instructions.registration.step3Desc")}
				/>
				<StepCard
					number={4}
					title={t("instructions.registration.step4Title")}
					description={t("instructions.registration.step4Desc")}
					screenshotLabel={t("instructions.registration.step4Screenshot")}
					screenshotDesc={t("instructions.registration.step4Desc")}
				/>
				<StepCard
					number={5}
					title={t("instructions.registration.step5Title")}
					description={t("instructions.registration.step5Desc")}
					screenshotLabel={t("instructions.registration.step5Screenshot")}
					screenshotDesc={t("instructions.registration.step5Desc")}
				/>
				<StepCard
					number={6}
					title={t("instructions.registration.step6Title")}
					description={t("instructions.registration.step6Desc")}
					screenshotLabel={t("instructions.registration.step6Screenshot")}
					screenshotDesc={t("instructions.registration.step6Desc")}
				/>
			</Paper>

			{/* Section 2: VPN Setup Guides */}
			<Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
				<SectionTitle
					icon={<SecurityIcon color="primary" />}
					title={t("instructions.vpnSetup.title")}
					id="vpn-setup"
				/>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					{t("instructions.vpnSetup.description")}
				</Typography>

				<Tabs
					value={vpnTab}
					onChange={(_e, val) => setVpnTab(val)}
					variant={isMobile ? "fullWidth" : "standard"}
					sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
				>
					{vpnTabs.map((tab) => (
						<Tab
							key={tab.key}
							icon={tab.icon}
							iconPosition="start"
							label={t(`instructions.${tab.key}.title` as never)}
							sx={{ textTransform: "none", minHeight: 48 }}
						/>
					))}
				</Tabs>

				{vpnTabs.map((tab, index) => (
					<Box key={tab.key} role="tabpanel" hidden={vpnTab !== index}>
						{vpnTab === index && (
							<Box>
								{(["step1", "step2", "step3", "step4", "step5"] as const).map(
									(step, stepIndex) => (
										<Box key={step} sx={{ mb: 3 }}>
											<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1 }}>
												<Chip
													label={stepIndex + 1}
													size="small"
													color="secondary"
													sx={{ fontWeight: 600, minWidth: 28, height: 24 }}
												/>
												<Typography variant="body1" fontWeight={500}>
													{t(`instructions.${tab.key}.${step}` as never)}
												</Typography>
											</Box>
											<ScreenshotPlaceholder
												label={t("instructions.vpnSetup.screenshot")}
												description={t(`instructions.${tab.key}.${step}` as never)}
											/>
										</Box>
									),
								)}
							</Box>
						)}
					</Box>
				))}
			</Paper>

			{/* Section 3: Changing Color Theme */}
			<Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
				<SectionTitle
					icon={<PaletteIcon color="primary" />}
					title={t("instructions.theme.title")}
					id="theme"
				/>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					{t("instructions.theme.description")}
				</Typography>

				<StepCard
					number={1}
					title={t("instructions.theme.step1Title")}
					description={t("instructions.theme.step1Desc")}
					screenshotLabel={t("instructions.theme.step1Screenshot")}
					screenshotDesc={t("instructions.theme.step1Desc")}
				/>
				<StepCard
					number={2}
					title={t("instructions.theme.step2Title")}
					description={t("instructions.theme.step2Desc")}
					screenshotLabel={t("instructions.theme.step2Screenshot")}
					screenshotDesc={t("instructions.theme.step2Desc")}
				/>
				<StepCard
					number={3}
					title={t("instructions.theme.step3Title")}
					description={t("instructions.theme.step3Desc")}
					screenshotLabel={t("instructions.theme.step3Screenshot")}
					screenshotDesc={t("instructions.theme.step3Desc")}
				/>
			</Paper>

			{/* Section 4: Changing Server */}
			<Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
				<SectionTitle
					icon={<LanguageIcon color="primary" />}
					title={t("instructions.server.title")}
					id="server"
				/>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					{t("instructions.server.description")}
				</Typography>

				<StepCard
					number={1}
					title={t("instructions.server.step1Title")}
					description={t("instructions.server.step1Desc")}
					screenshotLabel={t("instructions.server.step1Screenshot")}
					screenshotDesc={t("instructions.server.step1Desc")}
				/>
				<StepCard
					number={2}
					title={t("instructions.server.step2Title")}
					description={t("instructions.server.step2Desc")}
					screenshotLabel={t("instructions.server.step2Screenshot")}
					screenshotDesc={t("instructions.server.step2Desc")}
				/>
				<StepCard
					number={3}
					title={t("instructions.server.step3Title")}
					description={t("instructions.server.step3Desc")}
					screenshotLabel={t("instructions.server.step3Screenshot")}
					screenshotDesc={t("instructions.server.step3Desc")}
				/>
			</Paper>

			{/* Section 5: Managing Connections */}
			<Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
				<SectionTitle
					icon={<AddIcon color="primary" />}
					title={t("instructions.connections.title")}
					id="connections"
				/>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					{t("instructions.connections.description")}
				</Typography>

				{/* Sub-section: Creating New Connection */}
				<Typography variant="h6" fontWeight={600} sx={{ mb: 2, mt: 2 }}>
					{t("instructions.connections.newTitle")}
				</Typography>
				<StepCard
					number={1}
					title={t("instructions.connections.newStep1Title")}
					description={t("instructions.connections.newStep1Desc")}
					screenshotLabel={t("instructions.connections.newStep1Screenshot")}
					screenshotDesc={t("instructions.connections.newStep1Desc")}
				/>
				<StepCard
					number={2}
					title={t("instructions.connections.newStep2Title")}
					description={t("instructions.connections.newStep2Desc")}
					screenshotLabel={t("instructions.connections.newStep2Screenshot")}
					screenshotDesc={t("instructions.connections.newStep2Desc")}
				/>
				<StepCard
					number={3}
					title={t("instructions.connections.newStep3Title")}
					description={t("instructions.connections.newStep3Desc")}
					screenshotLabel={t("instructions.connections.newStep3Screenshot")}
					screenshotDesc={t("instructions.connections.newStep3Desc")}
				/>

				<Divider sx={{ my: 4 }} />

				{/* Sub-section: Changing Slots */}
				<Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
					{t("instructions.connections.slotsTitle")}
				</Typography>
				<StepCard
					number={1}
					title={t("instructions.connections.slotsStep1Title")}
					description={t("instructions.connections.slotsStep1Desc")}
					screenshotLabel={t("instructions.connections.slotsStep1Screenshot")}
					screenshotDesc={t("instructions.connections.slotsStep1Desc")}
				/>
				<StepCard
					number={2}
					title={t("instructions.connections.slotsStep2Title")}
					description={t("instructions.connections.slotsStep2Desc")}
					screenshotLabel={t("instructions.connections.slotsStep2Screenshot")}
					screenshotDesc={t("instructions.connections.slotsStep2Desc")}
				/>
			</Paper>

			{/* Section 6: FAQ */}
			<Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
				<SectionTitle
					icon={<HelpIcon color="primary" />}
					title={t("instructions.faq")}
					id="faq"
				/>

				<Accordion sx={{ mb: 1 }}>
					<AccordionSummary expandIcon={<KeyboardArrowDown />}>
						<Typography fontWeight={500}>
							{t("instructions.faqDevicesQ")}
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography color="text.secondary">
							{t("instructions.faqDevicesA")}
						</Typography>
					</AccordionDetails>
				</Accordion>

				<Accordion sx={{ mb: 1 }}>
					<AccordionSummary expandIcon={<KeyboardArrowDown />}>
						<Typography fontWeight={500}>
							{t("instructions.faqChangeServerQ")}
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography color="text.secondary">
							{t("instructions.faqChangeServerA")}
						</Typography>
					</AccordionDetails>
				</Accordion>

				<Accordion sx={{ mb: 1 }}>
					<AccordionSummary expandIcon={<KeyboardArrowDown />}>
						<Typography fontWeight={500}>
							{t("instructions.faqExpirationQ")}
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography color="text.secondary">
							{t("instructions.faqExpirationA")}
						</Typography>
					</AccordionDetails>
				</Accordion>

				<Accordion sx={{ mb: 1 }}>
					<AccordionSummary expandIcon={<KeyboardArrowDown />}>
						<Typography fontWeight={500}>
							{t("instructions.faqLoggingQ")}
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography color="text.secondary">
							{t("instructions.faqLoggingA")}
						</Typography>
					</AccordionDetails>
				</Accordion>
			</Paper>
		</Box>
	);
};

export default Instructions;
