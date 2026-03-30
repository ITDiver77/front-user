import axios, {
	type AxiosError,
	type AxiosInstance,
	type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const getToken = (): string | null => {
	return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const api: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 5000, // 5 second timeout to prevent long waits
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add JWT token
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = getToken();
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		// Optionally keep X-API-Key for admin operations? Not needed for user frontend.
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		const errorMessage = error.response?.data
			? (error.response.data as any).detail ||
				JSON.stringify(error.response.data)
			: error.message;

		console.error("API Error:", {
			url: error.config?.url,
			method: error.config?.method,
			status: error.response?.status,
			message: errorMessage,
			error,
		});

		// If token expired, redirect to login
		if (error.response?.status === 401) {
			// Clear token and redirect
			localStorage.removeItem("token");
			sessionStorage.removeItem("token");
			// Use window.location to redirect to login page
			if (window.location.pathname !== "/login") {
				window.location.href = "/login";
			}
		}

		return Promise.reject({
			status: error.response?.status,
			message: errorMessage,
			data: error.response?.data,
		});
	},
);

export default api;
