import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		env: {
			VITE_API_BASE_URL: "http://localhost:8000/api/v1",
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: [
				"src/services/*.ts",
				"src/pages/*.tsx",
				"src/components/**/*.tsx",
			],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
