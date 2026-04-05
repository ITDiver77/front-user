import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { CustomThemeProvider } from "./theme";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

ReactDOM.createRoot(rootEl).render(
	<React.StrictMode>
		<CustomThemeProvider>
			<CssBaseline />
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</CustomThemeProvider>
	</React.StrictMode>,
);
