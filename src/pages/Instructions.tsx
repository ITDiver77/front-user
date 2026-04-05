import {
	CheckCircle,
	Download,
	Help,
	Security,
	Settings,
} from "@mui/icons-material";
import {
	Box,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	Typography,
} from "@mui/material";
import { useLanguage } from "../i18n/LanguageContext";

const Instructions = () => {
	const { t } = useLanguage();

	return (
		<Box>
			<Typography variant="h4" sx={{ mb: 3 }}>
				{t("instructions.title")}
			</Typography>
			<Paper sx={{ p: 3, mb: 4 }}>
				<Typography variant="h5" gutterBottom>
					<Security sx={{ verticalAlign: "middle", mr: 1 }} />
					{t("instructions.subtitle")}
				</Typography>
				<Typography variant="body1" paragraph>
					{t("instructions.gettingStarted")}
				</Typography>
				<List>
					<ListItem>
						<ListItemIcon>
							<Download />
						</ListItemIcon>
						<ListItemText
							primary={t("instructions.step1Title")}
							secondary={t("instructions.step1Desc")}
						/>
					</ListItem>
					<ListItem>
						<ListItemIcon>
							<Settings />
						</ListItemIcon>
						<ListItemText
							primary={t("instructions.step2Title")}
							secondary={t("instructions.step2Desc")}
						/>
					</ListItem>
					<ListItem>
						<ListItemIcon>
							<CheckCircle />
						</ListItemIcon>
						<ListItemText
							primary={t("instructions.step3Title")}
							secondary={t("instructions.step3Desc")}
						/>
					</ListItem>
				</List>
			</Paper>

			<Paper sx={{ p: 3, mb: 4 }}>
				<Typography variant="h5" gutterBottom>
					{t("instructions.troubleshooting")}
				</Typography>
				<Typography variant="body2" paragraph>
					<strong>{t("instructions.connectionFails")}</strong>
					<br />• {t("instructions.connectionFailsTip1")}
					<br />• {t("instructions.connectionFailsTip2")}
					<br />• {t("instructions.connectionFailsTip3")}
				</Typography>
				<Typography variant="body2" paragraph>
					<strong>{t("instructions.slowSpeeds")}</strong>
					<br />• {t("instructions.slowSpeedsTip1")}
					<br />• {t("instructions.slowSpeedsTip2")}
				</Typography>
				<Typography variant="body2" paragraph>
					<strong>{t("instructions.configErrors")}</strong>
					<br />• {t("instructions.configErrorsTip1")}
					<br />• {t("instructions.configErrorsTip2")}
				</Typography>
			</Paper>

			<Paper sx={{ p: 3 }}>
				<Typography variant="h5" gutterBottom>
					<Help sx={{ verticalAlign: "middle", mr: 1 }} />
					{t("instructions.faq")}
				</Typography>
				<Typography variant="body2" paragraph>
					<strong>{t("instructions.faqDevicesQ")}</strong>
					<br />
					{t("instructions.faqDevicesA")}
				</Typography>
				<Typography variant="body2" paragraph>
					<strong>{t("instructions.faqChangeServerQ")}</strong>
					<br />
					{t("instructions.faqChangeServerA")}
				</Typography>
				<Typography variant="body2" paragraph>
					<strong>{t("instructions.faqExpirationQ")}</strong>
					<br />
					{t("instructions.faqExpirationA")}
				</Typography>
				<Typography variant="body2" paragraph>
					<strong>{t("instructions.faqLoggingQ")}</strong>
					<br />
					{t("instructions.faqLoggingA")}
				</Typography>
			</Paper>
		</Box>
	);
};

export default Instructions;
