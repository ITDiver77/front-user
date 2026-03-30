import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { CustomThemeProvider } from "./theme";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<CustomThemeProvider>
			<CssBaseline />
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</CustomThemeProvider>
	</React.StrictMode>,
);
