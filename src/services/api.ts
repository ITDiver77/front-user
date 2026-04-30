import axios, {
	type AxiosError,
	type AxiosInstance,
	type InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
	status?: number;
	data?: unknown;

	constructor(status: number | undefined, message: string, data?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
}

const getToken = (): string | null => {
	return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const api: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 5000,
	headers: {
		"Content-Type": "application/json",
	},
});

let isRedirecting = false;

api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		if (import.meta.env.DEV) {
			console.log("API Request:", {
				url: config.url,
				method: config.method?.toUpperCase(),
			});
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

api.interceptors.response.use(
	(response) => {
		if (import.meta.env.DEV) {
			console.log("API Response:", {
				url: response.config.url,
				status: response.status,
			});
		}
		return response;
	},
	(error: AxiosError) => {
		const responseData = error.response?.data as
			| Record<string, unknown>
			| undefined;
		const errorMessage = responseData
			? typeof responseData.detail === "string"
				? responseData.detail
				: JSON.stringify(responseData)
			: error.message;

		if (import.meta.env.DEV) {
			console.error("API Error:", {
				url: error.config?.url,
				status: error.response?.status,
				message: errorMessage,
			});
		}

		if (error.response?.status === 401 && !isRedirecting) {
			const authPages = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/"];
			const isOnAuthPage = authPages.some((p) => window.location.pathname.startsWith(p));
			if (!isOnAuthPage) {
				isRedirecting = true;
				localStorage.removeItem("token");
				sessionStorage.removeItem("token");
				window.location.href = "/login";
				setTimeout(() => {
					isRedirecting = false;
				}, 1000);
			}
		}

		return Promise.reject(
			new ApiError(error.response?.status, errorMessage, error.response?.data),
		);
	},
);

export default api;
