import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type ProxyOptions } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	// In Docker development, default to central_manager if not set
	const proxyTarget = env.VITE_PROXY_TARGET || "http://central_manager:8000";

	const proxyConfig: Record<string, ProxyOptions | string> = {
		"/api/v1": {
			target: proxyTarget,
			changeOrigin: true,
			secure: false,
		},
	};

	return {
		plugins: [react()],
		server: {
			port: 9556,
			host: true,
			origin: env.VITE_ORIGIN || "https://mythicalvpn.cloudns.nz",
			allowedHosts: env.VITE_ALLOWED_HOSTS
				? env.VITE_ALLOWED_HOSTS.split(",")
				: [
						"mythicalvpn.cloudns.nz",
						"devel.mythicalvpn.cloudns.nz",
						"portal.mythicalvpn.cloudns.nz",
						"localhost",
						".mythicalvpn.cloudns.nz",
					],
			proxy: proxyConfig,
		},
		preview: {
			port: 9556,
			host: true,
			allowedHosts: env.VITE_ALLOWED_HOSTS
				? env.VITE_ALLOWED_HOSTS.split(",")
				: [
						"mythicalvpn.cloudns.nz",
						"devel.mythicalvpn.cloudns.nz",
						"portal.mythicalvpn.cloudns.nz",
						"localhost",
						".mythicalvpn.cloudns.nz",
					],
			proxy: proxyConfig,
		},
		build: {
			outDir: "dist",
			sourcemap: false,
			minify: "esbuild",
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["react", "react-dom", "react-router-dom"],
						mui: ["@mui/material", "@mui/icons-material"],
						forms: ["react-hook-form", "@hookform/resolvers", "zod"],
					},
				},
			},
		},
	};
});
