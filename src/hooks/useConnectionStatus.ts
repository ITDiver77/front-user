import { useCallback, useEffect, useRef, useState } from "react";
import { connectionService } from "../services/connectionService";
import type { Connection } from "../types/connection";

interface UseConnectionStatusOptions {
	enabled?: boolean;
	baseInterval?: number;
	minInterval?: number;
	maxInterval?: number;
	activeMultiplier?: number;
}

interface UseConnectionStatusReturn {
	connections: Connection[];
	loading: boolean;
	error: string | null;
	lastUpdated: Date | null;
	isActive: boolean;
	refresh: () => Promise<void>;
	setIsActive: (active: boolean) => void;
}

export function useConnectionStatus(
	options: UseConnectionStatusOptions = {},
): UseConnectionStatusReturn {
	const {
		enabled = true,
		baseInterval = 10000,
		minInterval = 5000,
		maxInterval = 30000,
		activeMultiplier = 0.5,
	} = options;

	const [connections, setConnections] = useState<Connection[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [isActive, setIsActive] = useState(true);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const retryCountRef = useRef(0);
	const maxRetries = 5;

	const fetchConnections = useCallback(async () => {
		try {
			const data = await connectionService.getMyConnections();
			setConnections(data);
			setError(null);
			setLastUpdated(new Date());
			retryCountRef.current = 0;
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to fetch connections";
			setError(errorMessage);
			retryCountRef.current += 1;

			if (retryCountRef.current >= maxRetries) {
				console.error("Max retries reached for connection status fetch");
			}
		}
	}, []);

	const refresh = useCallback(async () => {
		await fetchConnections();
	}, [fetchConnections]);

	const calculateInterval = useCallback((): number => {
		let interval = baseInterval;

		if (!isActive) {
			interval = Math.min(baseInterval * 2, maxInterval);
		} else {
			interval = Math.max(baseInterval * activeMultiplier, minInterval);
		}

		if (retryCountRef.current > 0) {
			const backoff = Math.min(
				Math.pow(2, retryCountRef.current) * 1000,
				maxInterval,
			);
			interval = Math.min(interval + backoff, maxInterval);
		}

		return interval;
	}, [
		baseInterval,
		minInterval,
		maxInterval,
		activeMultiplier,
		isActive,
	]);

	useEffect(() => {
		if (!enabled) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		const startPolling = async () => {
			setLoading(true);
			await fetchConnections();
			setLoading(false);
		};

		startPolling();

		const scheduleNextFetch = () => {
			const interval = calculateInterval();
			intervalRef.current = setTimeout(async () => {
				await fetchConnections();
				scheduleNextFetch();
			}, interval);
		};

		scheduleNextFetch();

		return () => {
			if (intervalRef.current) {
				clearTimeout(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [enabled, fetchConnections, calculateInterval]);

	return {
		connections,
		loading,
		error,
		lastUpdated,
		isActive,
		refresh,
		setIsActive,
	};
}
