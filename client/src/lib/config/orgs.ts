export interface OrgConfig {
	slug: string;
	name: string;
	description: string;
	addresses: {
		governance: `0x${string}`;
		treasury?: `0x${string}`;
		membership?: `0x${string}`;
	};
}

const DEFAULT_ORGS: OrgConfig[] = [
	{
		slug: "muni_campana",
		name: "Municipio de Campana",
		description: "Transparencia en el uso de los fondos públicos del Municipio de Campana.",
		addresses: {
			governance: (import.meta.env.VITE_ORG_1_GOVERNANCE as `0x${string}`) || "0x0000000000000000000000000000000000000000"
		}
	},
	{
		slug: "club_ciudad_campana",
		name: "Club Ciudad de Campana",
		description: "Administración transparente de las cuotas y aportes extraordinarios de los socios del club.",
		addresses: {
			governance: (import.meta.env.VITE_ORG_2_GOVERNANCE as `0x${string}`) || "0x0000000000000000000000000000000000000000"
		}
	},
	{
		slug: "boca",
		name: "Boca Juniors",
		description: "Gobernanza comunitaria y rendición de cuentas para proyectos especiales de la comunidad xeneize.",
		addresses: {
			governance: (import.meta.env.VITE_ORG_3_GOVERNANCE as `0x${string}`) || "0x0000000000000000000000000000000000000000"
		}
	}
];

export function getAllOrgs(): OrgConfig[] {
	return DEFAULT_ORGS;
}

export function getOrg(slug: string): OrgConfig | undefined {
	return DEFAULT_ORGS.find((org) => org.slug === slug);
}
