import {
	Check as CheckIcon,
	Palette as PaletteIcon,
} from "@mui/icons-material";
import {
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tooltip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTelegramWebApp } from "../../hooks/useTelegramWebApp";
import { useTheme } from "../../theme";
import { availableThemes, type ThemeName } from "../../theme/types";

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
				<IconButton
					onClick={handleClick}
					color="inherit"
					component={motion.button}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<PaletteIcon />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				PaperProps={{
					component: motion.div,
					initial: { opacity: 0, y: -10 },
					animate: { opacity: 1, y: 0 },
					exit: { opacity: 0, y: -10 },
					sx: { borderRadius: 2, minWidth: 200 },
				}}
			>
				{availableThemes.map((theme) => (
					<MenuItem
						key={theme.name}
						onClick={() => handleSelectTheme(theme.name)}
						selected={themeName === theme.name}
						sx={{
							borderRadius: 1,
							mx: 1,
							"&.Mui-selected": {
								bgcolor: "action.selected",
								"&:hover": {
									bgcolor: "action.selected",
								},
							},
						}}
					>
						<ListItemText
							primary={theme.label}
							secondary={theme.description}
							primaryTypographyProps={{ fontWeight: 500 }}
							secondaryTypographyProps={{
								variant: "caption",
								color: "text.secondary",
							}}
						/>
						{themeName === theme.name && (
							<ListItemIcon sx={{ minWidth: "auto" }}>
								<CheckIcon color="primary" fontSize="small" />
							</ListItemIcon>
						)}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
