export const APP_BASE = "/app";

export const appPaths = {
	home: APP_BASE,
	discover: `${APP_BASE}/discover`,
	dashboard: `${APP_BASE}/dashboard`,
	admin: `${APP_BASE}/admin`,
	adminOrg: (slug: string) => `${APP_BASE}/admin/${slug}`,
	org: (slug: string) => `${APP_BASE}/org/${slug}`
} as const;