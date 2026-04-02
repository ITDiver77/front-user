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

const lightThemes: ThemeName[] = ["light", "limeGreen", "rosePink"];

const themePairs: { dark: ThemeName; light: ThemeName }[] = [
	{ dark: "greenMint", light: "limeGreen" },
	{ dark: "pinkPurple", light: "rosePink" },
];

const otherDarkThemes = darkThemes.filter(
	(d) => !themePairs.some((p) => p.dark === d),
);
const otherLightThemes = lightThemes.filter(
	(l) => !themePairs.some((p) => p.light === l),
);

function getThemeConfig(name: ThemeName) {
	return availableThemes.find((t) => t.name === name);
}

export function ThemeSelector() {
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

	return (
		<>
			<Tooltip title="Change theme">
				<IconButton onClick={handleClick} color="inherit">
					<PaletteIcon />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				PaperProps={{
					sx: { borderRadius: 2, minWidth: 360, p: 1 },
				}}
			>
				<Typography variant="caption" color="text.secondary" sx={{ px: 1, pb: 1 }}>
					Dark
				</Typography>
				<Grid container spacing={0.5}>
					{themePairs.map(({ dark, light }) => {
						const darkTheme = getThemeConfig(dark);
						const lightTheme = getThemeConfig(light);
						if (!darkTheme || !lightTheme) return null;
						return (
							<Grid item xs={6} key={dark}>
								<MenuItem
									onClick={() => handleSelectTheme(darkTheme.name)}
									selected={themeName === darkTheme.name}
									sx={{ borderRadius: 1, mb: 0.5 }}
								>
									<ListItemText
										primary={darkTheme.label}
										primaryTypographyProps={{ fontWeight: 500, fontSize: 13 }}
									/>
									{themeName === darkTheme.name && (
										<ListItemIcon sx={{ minWidth: "auto" }}>
											<CheckIcon color="primary" fontSize="small" />
										</ListItemIcon>
									)}
								</MenuItem>
								<MenuItem
									onClick={() => handleSelectTheme(lightTheme.name)}
									selected={themeName === lightTheme.name}
									sx={{ borderRadius: 1 }}
								>
									<ListItemText
										primary={lightTheme.label}
										secondary={lightTheme.description}
										primaryTypographyProps={{ fontWeight: 500, fontSize: 13 }}
										secondaryTypographyProps={{ variant: "caption" }}
									/>
									{themeName === lightTheme.name && (
										<ListItemIcon sx={{ minWidth: "auto" }}>
											<CheckIcon color="primary" fontSize="small" />
										</ListItemIcon>
									)}
								</MenuItem>
							</Grid>
						);
					})}
					{otherDarkThemes.map((name) => {
						const theme = getThemeConfig(name);
						if (!theme) return null;
						return (
							<Grid item xs={6} key={name}>
								<MenuItem
									onClick={() => handleSelectTheme(theme.name)}
									selected={themeName === theme.name}
									sx={{ borderRadius: 1 }}
								>
									<ListItemText
										primary={theme.label}
										primaryTypographyProps={{ fontWeight: 500, fontSize: 13 }}
									/>
									{themeName === theme.name && (
										<ListItemIcon sx={{ minWidth: "auto" }}>
											<CheckIcon color="primary" fontSize="small" />
										</ListItemIcon>
									)}
								</MenuItem>
							</Grid>
						);
					})}
				</Grid>
				{otherLightThemes.length > 0 && (
					<>
						<Typography variant="caption" color="text.secondary" sx={{ px: 1, pt: 1 }}>
							Light
						</Typography>
						<Grid container spacing={0.5} sx={{ mt: 0 }}>
							{otherLightThemes.map((name) => {
								const theme = getThemeConfig(name);
								if (!theme) return null;
								return (
									<Grid item xs={6} key={name}>
										<MenuItem
											onClick={() => handleSelectTheme(theme.name)}
											selected={themeName === theme.name}
											sx={{ borderRadius: 1 }}
										>
											<ListItemText
												primary={theme.label}
												secondary={theme.description}
												primaryTypographyProps={{ fontWeight: 500, fontSize: 13 }}
												secondaryTypographyProps={{ variant: "caption" }}
											/>
											{themeName === theme.name && (
												<ListItemIcon sx={{ minWidth: "auto" }}>
													<CheckIcon color="primary" fontSize="small" />
												</ListItemIcon>
											)}
										</MenuItem>
									</Grid>
								);
							})}
						</Grid>
					</>
				)}
			</Menu>
		</>
	);
}
