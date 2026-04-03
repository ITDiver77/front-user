import {
	Check as CheckIcon,
	Palette as PaletteIcon,
} from "@mui/icons-material";
import {
	Grid,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tooltip,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { useTelegramWebApp } from "../../hooks/useTelegramWebApp";
import { useLanguage } from "../../i18n/LanguageContext";
import { useTheme } from "../../theme";
import { availableThemes, type ThemeName } from "../../theme/types";

const darkThemes: ThemeName[] = [
	"amberGold",
	"brownCoffee",
	"cyanBlue",
	"dark",
	"darkBlue",
	"darkPurple",
	"darkTeal",
	"greenMint",
	"greySteel",
	"indigoSlate",
	"orangeDeep",
	"pinkPurple",
	"redCrimson",
];

const lightThemes: ThemeName[] = ["limeGreen", "rosePink", "honey", "ocean", "lavender", "sunset", "violet", "teal", "coral", "skyBlue", "peach", "sage"];

function getThemeConfig(name: ThemeName) {
	return availableThemes.find((t) => t.name === name);
}

export function ThemeSelector() {
	const { t } = useLanguage();
	const { themeName, setThemeName } = useTheme();
	const { isTelegram } = useTelegramWebApp();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelectTheme = (name: ThemeName) => {
		setThemeName(name);
		handleClose();
	};

	if (isTelegram) {
		return null;
	}

	const darkSorted = darkThemes
		.map(getThemeConfig)
		.filter(Boolean)
		.sort((a, b) => a!.label.localeCompare(b!.label));

	const lightSorted = lightThemes
		.map(getThemeConfig)
		.filter(Boolean)
		.sort((a, b) => a!.label.localeCompare(b!.label));

	return (
		<>
			<Tooltip title={t("nav.changeTheme")}>
				<IconButton onClick={handleClick} color="inherit">
					<PaletteIcon />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				PaperProps={{
					sx: { borderRadius: 2, minWidth: 400, p: 1 },
				}}
			>
				<Grid container spacing={1}>
					<Grid item xs={6}>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ px: 1, pb: 0.5, display: "block" }}
						>
							{t("themeSelector.dark")}
						</Typography>
						{darkSorted.map((theme) => {
							if (!theme) return null;
							return (
								<MenuItem
									key={theme.name}
									onClick={() => handleSelectTheme(theme.name)}
									selected={themeName === theme.name}
									sx={{ borderRadius: 1, mb: 0.5 }}
								>
									<ListItemText
										primary={t(`themes.${theme.name}` as never)}
										secondary={t(`themes.${theme.name}Desc` as never)}
										primaryTypographyProps={{ fontWeight: 500, fontSize: 13 }}
										secondaryTypographyProps={{ variant: "caption" }}
									/>
									{themeName === theme.name && (
										<ListItemIcon sx={{ minWidth: "auto" }}>
											<CheckIcon color="primary" fontSize="small" />
										</ListItemIcon>
									)}
								</MenuItem>
							);
						})}
					</Grid>
					<Grid item xs={6}>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ px: 1, pb: 0.5, display: "block" }}
						>
							{t("themeSelector.light")}
						</Typography>
						{lightSorted.map((theme) => {
							if (!theme) return null;
							return (
								<MenuItem
									key={theme.name}
									onClick={() => handleSelectTheme(theme.name)}
									selected={themeName === theme.name}
									sx={{ borderRadius: 1, mb: 0.5 }}
								>
									<ListItemText
										primary={t(`themes.${theme.name}` as never)}
										secondary={t(`themes.${theme.name}Desc` as never)}
										primaryTypographyProps={{ fontWeight: 500, fontSize: 13 }}
										secondaryTypographyProps={{ variant: "caption" }}
									/>
									{themeName === theme.name && (
										<ListItemIcon sx={{ minWidth: "auto" }}>
											<CheckIcon color="primary" fontSize="small" />
										</ListItemIcon>
									)}
								</MenuItem>
							);
						})}
					</Grid>
				</Grid>
			</Menu>
		</>
	);
}
