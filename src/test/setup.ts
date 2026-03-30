// Mock import.meta for axios and other modules
const mockImportMeta = {
	env: { VITE_API_BASE_URL: "http://localhost:8000/api/v1" },
	url: "http://localhost",
};

// @ts-expect-error
globalThis.importMeta = mockImportMeta;

// Mock window.location
Object.defineProperty(window, "location", {
	value: {
		href: "",
		pathname: "/",
		assign: vi.fn(),
	},
	writable: true,
});

// Mock window.location.href setter
Object.defineProperty(window, "location", {
	set: (value: string) => {
		window.location.href = value;
	},
});

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock scrollIntoView
if (typeof Element !== "undefined") {
	Element.prototype.scrollIntoView = vi.fn();
}
