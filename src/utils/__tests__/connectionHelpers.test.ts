import { describe, expect, it } from "vitest";
import { getCopyValue } from "../connectionHelpers";

describe("getCopyValue - subscription_url preference", () => {
	it("should prefer subscription_url over connection_string", () => {
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
		} as any;

		expect(getCopyValue(connection)).toBe(
			"https://mythicalvpn.cloudns.nz/sub/token123",
		);
	});

	it("should use subscription_url when connection_string is null", () => {
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
		} as any;

		expect(getCopyValue(connection)).toBe(
			"https://mythicalvpn.cloudns.nz/sub/token123",
		);
	});

	it("should fall back to connection_string when subscription_url is null", () => {
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
		} as any;

		expect(getCopyValue(connection)).toBe("vless://abc123@testserver.com:443");
	});

	it("should return null when both subscription_url and connection_string are null", () => {
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
			subscription_url: null,
		} as any;

		expect(getCopyValue(connection)).toBeNull();
	});
});
