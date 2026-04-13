import {
	AddCircle as AddIcon,
	Computer as ComputerIcon,
	ExpandMore as ExpandMoreIcon,
	Help as HelpIcon,
	Image as ImageIcon,
	KeyboardArrowDown,
	Palette as PaletteIcon,
	PersonAdd as PersonAddIcon,
	PhoneAndroid as PhoneIcon,
	Security as SecurityIcon,
	Storage as StorageIcon,
	SwapHoriz as SwapIcon,
} from "@mui/icons-material";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alpha,
	Box,
	Button,
	Chip,
	Collapse,
	Divider,
	IconButton,
	Paper,
	Tab,
	Tabs,
	Typography,
	useMediaQuery,
	useTheme as useMuiTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const ScreenshotPlaceholder = ({
	label,
	description,
	visible,
	onToggle,
}: {
	label: string;
	description: string;
	visible: boolean;
	onToggle: () => void;
}) => (
	<Box sx={{ my: 1 }}>
		<Button
			size="small"
			startIcon={<ImageIcon fontSize="small" />}
			onClick={onToggle}
			sx={{ textTransform: "none", color: "text.secondary", mb: 0.5 }}
		>
			{visible ? "hide screenshot" : "show screenshot"}
		</Button>
		<Collapse in={visible}>
			<Box
				sx={{
					width: "100%",
					maxWidth: 480,
					height: 180,
					mx: "auto",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					bgcolor: "action.hover",
					borderRadius: 2,
					border: "2px dashed",
					borderColor: "divider",
				}}
			>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					{label}
				</Typography>
				<Typography variant="caption" color="text.disabled">
					{description}
				</Typography>
			</Box>
		</Collapse>
	</Box>
);

interface StepProps {
	number: number;
	title: string;
	description: string;
	screenshotLabel: string;
	screenshotDesc: string;
	openScreenshots: Record<number, boolean>;
	toggleScreenshot: (n: number) => void;
}

const Step = ({
	number,
	title,
	description,
	screenshotLabel,
	screenshotDesc,
	openScreenshots,
	toggleScreenshot,
}: StepProps) => (
	<Box
		sx={{
			display: "flex",
			gap: 1.5,
			mb: 2,
		}}
		component={motion.div}
		initial={{ opacity: 0, x: -10 }}
		whileInView={{ opacity: 1, x: 0 }}
		viewport={{ once: true, margin: "-30px" }}
		transition={{ duration: 0.25 }}
	>
		<Box
			sx={{
				width: 28,
				height: 28,
				minWidth: 28,
				borderRadius: "50%",
				bgcolor: "primary.main",
				color: "primary.contrastText",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: "0.8rem",
				fontWeight: 700,
				mt: 0.3,
			}}
		>
			{number}
		</Box>
		<Box sx={{ flex: 1 }}>
			<Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.3 }}>
				{title}
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
				{description}
			</Typography>
			<ScreenshotPlaceholder
				label={screenshotLabel}
				description={screenshotDesc}
				visible={!!openScreenshots[number]}
				onToggle={() => toggleScreenshot(number)}
			/>
		</Box>
	</Box>
);

const TOCCard = ({
	icon,
	label,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}) => (
	<Paper
		variant="outlined"
		onClick={onClick}
		sx={{
			p: 1.5,
			cursor: "pointer",
			display: "flex",
			alignItems: "center",
			gap: 1,
			transition: "all 0.2s",
			"&:hover": {
				borderColor: "primary.main",
				bgcolor: "action.hover",
				transform: "translateY(-2px)",
			},
		}}
		component={motion.div}
		whileTap={{ scale: 0.97 }}
	>
		<Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
		<Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.3 }}>
			{label}
		</Typography>
	</Paper>
);

const Instructions = () => {
	const { t } = useLanguage();
	const muiTheme = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
	const [vpnTab, setVpnTab] = useState(0);
	const [regScreenshots, setRegScreenshots] = useState<Record<number, boolean>>({});
	const [themeScreenshots, setThemeScreenshots] = useState<Record<number, boolean>>({});
	const [serverScreenshots, setServerScreenshots] = useState<Record<number, boolean>>({});
	const [connNewScreenshots, setConnNewScreenshots] = useState<Record<number, boolean>>({});
	const [connSlotsScreenshots, setConnSlotsScreenshots] = useState<Record<number, boolean>>({});
	const [vpnScreenshots, setVpnScreenshots] = useState<Record<string, boolean>>({});
	const [expandedSection, setExpandedSection] = useState<string | false>(
		"registration",
	);

	const toggleScreenshot = (
		setter: React.Dispatch<React.SetStateAction<Record<number, boolean>>>,
		n: number,
	) => setter((prev) => ({ ...prev, [n]: !prev[n] }));

	const toggleVpnScreenshot = (key: string) =>
		setVpnScreenshots((prev) => ({ ...prev, [key]: !prev[key] }));

	const handleSectionToggle =
		(section: string) => (_: React.SyntheticEvent, isExpanded: boolean) =>
			setExpandedSection(isExpanded ? section : false);

	const scrollTo = (id: string) => {
		setExpandedSection(id);
		setTimeout(() => {
			const el = document.getElementById(`section-${id}`);
			if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 100);
	};

	const sections = [
		{
			id: "registration",
			icon: <PersonAddIcon fontSize="small" />,
			label: t("instructions.registration.title"),
		},
		{
			id: "vpn-setup",
			icon: <SecurityIcon fontSize="small" />,
			label: t("instructions.vpnSetup.title"),
		},
		{
			id: "theme",
			icon: <PaletteIcon fontSize="small" />,
			label: t("instructions.theme.title"),
		},
		{
			id: "server",
			icon: <SwapIcon fontSize="small" />,
			label: t("instructions.server.title"),
		},
		{
			id: "connections",
			icon: <AddIcon fontSize="small" />,
			label: t("instructions.connections.title"),
		},
		{
			id: "faq",
			icon: <HelpIcon fontSize="small" />,
			label: t("instructions.faq"),
		},
	];

	const vpnTabs = [
		{ key: "windows", icon: <ComputerIcon fontSize="small" /> },
		{ key: "android", icon: <PhoneIcon fontSize="small" /> },
		{ key: "ios", icon: <PhoneIcon fontSize="small" /> },
		{ key: "linux", icon: <StorageIcon fontSize="small" /> },
	];

	return (
		<Box>
			<Typography
				variant={isMobile ? "h5" : "h4"}
				fontWeight={700}
				sx={{ mb: 0.5 }}
				component={motion.h1}
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				{t("instructions.title")}
			</Typography>
			<Typography
				variant="body2"
				color="text.secondary"
				sx={{ mb: 3 }}
				component={motion.p}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				{t("instructions.subtitle")}
			</Typography>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr 1fr",
						sm: "repeat(3, 1fr)",
					},
					gap: 1,
					mb: 3,
				}}
				component={motion.div}
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.15 }}
			>
				{sections.map((s) => (
					<TOCCard
						key={s.id}
						icon={s.icon}
						label={s.label}
						onClick={() => scrollTo(s.id)}
					/>
				))}
			</Box>

			<Accordion
				id="section-registration"
				expanded={expandedSection === "registration"}
				onChange={handleSectionToggle("registration")}
				sx={{ mb: 1, scrollMarginTop: 70 }}
				component={motion.div}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.2 }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<PersonAddIcon color="primary" fontSize="small" />
						<Typography fontWeight={600}>
							{t("instructions.registration.title")}
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails sx={{ pt: 0 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{t("instructions.registration.description")}
					</Typography>
					{[1, 2, 3, 4, 5, 6].map((n) => (
						<Step
							key={n}
							number={n}
							title={t(`instructions.registration.step${n}Title`)}
							description={t(`instructions.registration.step${n}Desc`)}
							screenshotLabel={t(`instructions.registration.step${n}Screenshot`)}
							screenshotDesc={t(`instructions.registration.step${n}Desc`)}
							openScreenshots={regScreenshots}
							toggleScreenshot={(num) => toggleScreenshot(setRegScreenshots, num)}
						/>
					))}
				</AccordionDetails>
			</Accordion>

			<Accordion
				id="section-vpn-setup"
				expanded={expandedSection === "vpn-setup"}
				onChange={handleSectionToggle("vpn-setup")}
				sx={{ mb: 1, scrollMarginTop: 70 }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<SecurityIcon color="primary" fontSize="small" />
						<Typography fontWeight={600}>
							{t("instructions.vpnSetup.title")}
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails sx={{ pt: 0 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{t("instructions.vpnSetup.description")}
					</Typography>
					<Tabs
						value={vpnTab}
						onChange={(_, val) => setVpnTab(val)}
						variant="scrollable"
						scrollButtons="auto"
						sx={{ borderBottom: 1, borderColor: "divider", mb: 2, minHeight: 40 }}
					>
						{vpnTabs.map((tab) => (
							<Tab
								key={tab.key}
								icon={tab.icon}
								iconPosition="start"
								label={t(`instructions.${tab.key}.title` as never)}
								sx={{ textTransform: "none", minHeight: 40, py: 0 }}
							/>
						))}
					</Tabs>

					{vpnTabs.map((tab, index) => (
						<Box key={tab.key} role="tabpanel" hidden={vpnTab !== index}>
							{vpnTab === index && (
								<Box>
									{(
										["step1", "step2", "step3", "step4", "step5"] as const
									).map((step, si) => {
										const key = `${tab.key}-${step}`;
										return (
											<Box key={step} sx={{ mb: 2 }}>
												<Box
													sx={{
														display: "flex",
														alignItems: "flex-start",
														gap: 1.5,
													}}
												>
													<Box
														sx={{
															width: 24,
															height: 24,
															minWidth: 24,
															borderRadius: "50%",
															bgcolor: "secondary.main",
															color: "secondary.contrastText",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															fontSize: "0.7rem",
															fontWeight: 700,
															mt: 0.1,
														}}
													>
														{si + 1}
													</Box>
													<Box sx={{ flex: 1 }}>
														<Typography variant="body2" fontWeight={500}>
															{t(`instructions.${tab.key}.${step}` as never)}
														</Typography>
														<Button
															size="small"
															startIcon={<ImageIcon fontSize="small" />}
															onClick={() => toggleVpnScreenshot(key)}
															sx={{
																textTransform: "none",
																color: "text.secondary",
																mt: 0.5,
															}}
														>
															{vpnScreenshots[key] ? "hide" : "show screenshot"}
														</Button>
														<Collapse in={!!vpnScreenshots[key]}>
															<Box
																sx={{
																	width: "100%",
																	maxWidth: 480,
																	height: 150,
																	mx: "auto",
																	display: "flex",
																	flexDirection: "column",
																	alignItems: "center",
																	justifyContent: "center",
																	bgcolor: "action.hover",
																	borderRadius: 2,
																	border: "2px dashed",
																	borderColor: "divider",
																	mt: 1,
																}}
															>
																<Typography
																	variant="body2"
																	color="text.secondary"
																>
																	{t("instructions.vpnSetup.screenshot")}
																</Typography>
															</Box>
														</Collapse>
													</Box>
												</Box>
											</Box>
										);
									})}
								</Box>
							)}
						</Box>
					))}
				</AccordionDetails>
			</Accordion>

			<Accordion
				id="section-theme"
				expanded={expandedSection === "theme"}
				onChange={handleSectionToggle("theme")}
				sx={{ mb: 1, scrollMarginTop: 70 }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<PaletteIcon color="primary" fontSize="small" />
						<Typography fontWeight={600}>
							{t("instructions.theme.title")}
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails sx={{ pt: 0 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{t("instructions.theme.description")}
					</Typography>
					{[1, 2, 3].map((n) => (
						<Step
							key={n}
							number={n}
							title={t(`instructions.theme.step${n}Title`)}
							description={t(`instructions.theme.step${n}Desc`)}
							screenshotLabel={t(`instructions.theme.step${n}Screenshot`)}
							screenshotDesc={t(`instructions.theme.step${n}Desc`)}
							openScreenshots={themeScreenshots}
							toggleScreenshot={(num) =>
								toggleScreenshot(setThemeScreenshots, num)
							}
						/>
					))}
				</AccordionDetails>
			</Accordion>

			<Accordion
				id="section-server"
				expanded={expandedSection === "server"}
				onChange={handleSectionToggle("server")}
				sx={{ mb: 1, scrollMarginTop: 70 }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<SwapIcon color="primary" fontSize="small" />
						<Typography fontWeight={600}>
							{t("instructions.server.title")}
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails sx={{ pt: 0 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{t("instructions.server.description")}
					</Typography>
					{[1, 2, 3].map((n) => (
						<Step
							key={n}
							number={n}
							title={t(`instructions.server.step${n}Title`)}
							description={t(`instructions.server.step${n}Desc`)}
							screenshotLabel={t(`instructions.server.step${n}Screenshot`)}
							screenshotDesc={t(`instructions.server.step${n}Desc`)}
							openScreenshots={serverScreenshots}
							toggleScreenshot={(num) =>
								toggleScreenshot(setServerScreenshots, num)
							}
						/>
					))}
				</AccordionDetails>
			</Accordion>

			<Accordion
				id="section-connections"
				expanded={expandedSection === "connections"}
				onChange={handleSectionToggle("connections")}
				sx={{ mb: 1, scrollMarginTop: 70 }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<AddIcon color="primary" fontSize="small" />
						<Typography fontWeight={600}>
							{t("instructions.connections.title")}
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails sx={{ pt: 0 }}>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						{t("instructions.connections.description")}
					</Typography>

					<Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, mt: 1 }}>
						{t("instructions.connections.newTitle")}
					</Typography>
					{[1, 2, 3].map((n) => (
						<Step
							key={`new-${n}`}
							number={n}
							title={t(`instructions.connections.newStep${n}Title`)}
							description={t(`instructions.connections.newStep${n}Desc`)}
							screenshotLabel={t(`instructions.connections.newStep${n}Screenshot`)}
							screenshotDesc={t(`instructions.connections.newStep${n}Desc`)}
							openScreenshots={connNewScreenshots}
							toggleScreenshot={(num) =>
								toggleScreenshot(setConnNewScreenshots, num)
							}
						/>
					))}

					<Divider sx={{ my: 2 }} />

					<Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
						{t("instructions.connections.slotsTitle")}
					</Typography>
					{[1, 2].map((n) => (
						<Step
							key={`slots-${n}`}
							number={n}
							title={t(`instructions.connections.slotsStep${n}Title`)}
							description={t(`instructions.connections.slotsStep${n}Desc`)}
							screenshotLabel={t(`instructions.connections.slotsStep${n}Screenshot`)}
							screenshotDesc={t(`instructions.connections.slotsStep${n}Desc`)}
							openScreenshots={connSlotsScreenshots}
							toggleScreenshot={(num) =>
								toggleScreenshot(setConnSlotsScreenshots, num)
							}
						/>
					))}
				</AccordionDetails>
			</Accordion>

			<Accordion
				id="section-faq"
				expanded={expandedSection === "faq"}
				onChange={handleSectionToggle("faq")}
				sx={{ mb: 1, scrollMarginTop: 70 }}
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<HelpIcon color="primary" fontSize="small" />
						<Typography fontWeight={600}>
							{t("instructions.faq")}
						</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails sx={{ pt: 0 }}>
					{[
						{
							q: "instructions.faqDevicesQ",
							a: "instructions.faqDevicesA",
						},
						{
							q: "instructions.faqChangeServerQ",
							a: "instructions.faqChangeServerA",
						},
						{
							q: "instructions.faqExpirationQ",
							a: "instructions.faqExpirationA",
						},
						{
							q: "instructions.faqLoggingQ",
							a: "instructions.faqLoggingA",
						},
					].map((faq) => (
						<Accordion key={faq.q} sx={{ mb: 0.5 }} defaultExpanded={false}>
							<AccordionSummary expandIcon={<KeyboardArrowDown />}>
								<Typography variant="body2" fontWeight={500}>
									{t(faq.q)}
								</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<Typography variant="body2" color="text.secondary">
									{t(faq.a)}
								</Typography>
							</AccordionDetails>
						</Accordion>
					))}
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};

export default Instructions;
