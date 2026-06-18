// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace svelteHTML {
		interface IntrinsicElements {
			"appkit-button": { balance?: "show" | "hide"; disabled?: boolean };
			"appkit-connect-button": Record<string, unknown>;
			"appkit-account-button": { balance?: "show" | "hide"; disabled?: boolean };
			"appkit-network-button": Record<string, unknown>;
		}
	}
}

export {};
