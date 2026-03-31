import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import type { Connection } from "../types/connection";

interface ConnectionStatusContextType {
	connections: Connection[];
	loading: boolean;
	error: string | null;
	lastUpdated: Date | null;
	isActive: boolean;
	setIsActive: (active: boolean) => void;
	refresh: () => Promise<void>;
	getConnectionByName: (name: string) => Connection | undefined;
	isStatusChanged: (connectionName: string) => boolean;
	acknowledgeStatusChange: (connectionName: string) => void;
}

const ConnectionStatusContext = createContext<
	ConnectionStatusContextType | undefined
>(undefined);

interface ConnectionStatusProviderProps {
	children: ReactNode;
	baseInterval?: number;
	minInterval?: number;
	maxInterval?: number;
	enabled?: boolean;
}

export const ConnectionStatusProvider = ({
	children,
	baseInterval = 10000,
	minInterval = 5000,
	maxInterval = 30000,
	enabled = true,
}: ConnectionStatusProviderProps) => {
	const {
		connections,
		loading,
		error,
		lastUpdated,
		isActive,
		setIsActive,
		refresh,
	} = useConnectionStatus({
		enabled,
		baseInterval,
		minInterval,
		maxInterval,
	});

	const [changedConnections, setChangedConnections] = useState<Set<string>>(
		new Set(),
	);
	const previousConnectionsRef = useRef<Map<string, Connection>>(new Map());

	const getConnectionByName = useCallback(
		(connectionName: string): Connection | undefined => {
			return connections.find((c) => c.connection_name === connectionName);
		},
		[connections],
	);

	const isStatusChanged = useCallback(
		(connectionName: string): boolean => {
			return changedConnections.has(connectionName);
		},
		[changedConnections],
	);

	const acknowledgeStatusChange = useCallback((connectionName: string) => {
		setChangedConnections((prev) => {
			const next = new Set(prev);
			next.delete(connectionName);
			return next;
		});
	}, []);

	useEffect(() => {
		const previousMap = previousConnectionsRef.current;
		const newChanged = new Set<string>();

		connections.forEach((conn) => {
			const prev = previousMap.get(conn.connection_name);
			if (prev) {
				if (
					prev.enabled !== conn.enabled ||
					prev.is_active !== conn.is_active ||
					prev.paydate !== conn.paydate
				) {
					newChanged.add(conn.connection_name);
				}
			}
			previousMap.set(conn.connection_name, conn);
		});

		if (newChanged.size > 0) {
			setChangedConnections((prev) => {
				const merged = new Set([...prev, ...newChanged]);
				return merged;
			});
		}
	}, [connections]);

	const value = useMemo(
		() => ({
			connections,
			loading,
			error,
			lastUpdated,
			isActive,
			setIsActive,
			refresh,
			getConnectionByName,
			isStatusChanged,
			acknowledgeStatusChange,
		}),
		[
			connections,
			loading,
			error,
			lastUpdated,
			isActive,
			setIsActive,
			refresh,
			getConnectionByName,
			isStatusChanged,
			acknowledgeStatusChange,
		],
	);

	return (
		<ConnectionStatusContext.Provider value={value}>
			{children}
		</ConnectionStatusContext.Provider>
	);
};

export const useConnectionStatusContext = (): ConnectionStatusContextType => {
	const context = useContext(ConnectionStatusContext);
	if (!context) {
		throw new Error(
			"useConnectionStatusContext must be used within ConnectionStatusProvider",
		);
	}
	return context;
};
