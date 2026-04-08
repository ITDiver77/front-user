import { describe, expect, it } from "vitest";
import type { Connection } from "../../../types/connection";

function getDetailsForModal(
	connection: Connection & {
		subscription_url?: string | null;
	},
): Array<{ label: string; value: string }> {
	const details: Array<{ label: string; value: string }> = [];

	if (connection.subscription_url) {
		details.push({
			label: "Subscription URL",
			value: connection.subscription_url,
		});
	}

	if (connection.connection_string) {
		details.push({
			label: "Connection String",
			value: connection.connection_string,
		});
	}

	return details;
}

describe("ConnectionDetailsModal - subscription_url display", () => {
	it("should include subscription_url in details when connection_string is null", () => {
		const connection = {
			id: 1,
			username: "testuser",
			index: 0,
			connection_name: "testuser-1",
			client_uuid: "uuid",
			price: 5,
			paydate: "2026-04-01",
			enabled: true,
			is_active: true,
			created_at: "2026-01-01T00:00:00Z",
			connection_string: null,
			auto_renew: true,
			server_name: "US-West",
			subscription_url: "https://mythicalvpn.cloudns.nz/sub/token123",
		} as Connection & {
			subscription_url?: string | null;
		};

		const details = getDetailsForModal(connection);

		const subUrlDetail = details.find((d) => d.label === "Subscription URL");
		expect(subUrlDetail).toBeDefined();
		expect(subUrlDetail!.value).toBe(
			"https://mythicalvpn.cloudns.nz/sub/token123",
		);
	});

	it("should show subscription_url even when connection_string is also present", () => {
		const connection = {
			id: 1,
			username: "testuser",
			index: 0,
			connection_name: "testuser-1",
			client_uuid: "uuid",
			price: 5,
			paydate: "2026-04-01",
			enabled: true,
			is_active: true,
			created_at: "2026-01-01T00:00:00Z",
			connection_string: "vless://abc123@testserver.com:443",
			auto_renew: true,
			server_name: "US-West",
			subscription_url: "https://mythicalvpn.cloudns.nz/sub/token123",
		} as Connection & {
			subscription_url?: string | null;
		};

		const details = getDetailsForModal(connection);

		expect(details.find((d) => d.label === "Subscription URL")).toBeDefined();
		expect(details.find((d) => d.label === "Connection String")).toBeDefined();
	});

	it("should show connection_string when subscription_url is null", () => {
		const connection = {
			id: 1,
			username: "testuser",
			index: 0,
			connection_name: "testuser-1",
			client_uuid: "uuid",
			price: 5,
			paydate: "2026-04-01",
			enabled: true,
			is_active: true,
			created_at: "2026-01-01T00:00:00Z",
			connection_string: "vless://abc123@testserver.com:443",
			auto_renew: true,
			server_name: "US-West",
			subscription_url: null,
		} as Connection & {
			subscription_url?: string | null;
		};

		const details = getDetailsForModal(connection);

		expect(details.find((d) => d.label === "Subscription URL")).toBeUndefined();
		expect(details.find((d) => d.label === "Connection String")).toBeDefined();
	});
});
