export interface OrgConfig {
	slug: string;
	name: string;
	description: string;
	/** Imagen estática para Discover (carga instantánea sin RPC). */
	nftImage?: string;
	/** Token ID del membership cuyo tokenURI representa la imagen de la org en Discover (default: 1). */
	membershipDisplayTokenId?: number;
	addresses: {
		governance: `0x${string}`;
		treasury?: `0x${string}`;
		membership?: `0x${string}`;
	};
}

const DEFAULT_ORGS: OrgConfig[] = [
	{
		slug: "muni",
		name: "Municipio de Puerto Lumen",
		description: "Transparencia en el uso de los fondos públicos del Municipio de Puerto Lumen.",
		nftImage: "/nft/muni.webp",
		membershipDisplayTokenId: 1,
		addresses: {
			governance: (import.meta.env.VITE_ORG_1_GOVERNANCE as `0x${string}`) || "0x3fE8874Da46F056e4f5C04dba5A1ad5C3588E675"
		}
	},
	{
		slug: "club",
		name: "Club Ciudad de Puerto Lumen",
		description: "Administración transparente de las cuotas y aportes extraordinarios de los socios del club.",
		nftImage: "/nft/club.webp",
		membershipDisplayTokenId: 1,
		addresses: {
			governance: (import.meta.env.VITE_ORG_2_GOVERNANCE as `0x${string}`) || "0x8E5E90c1fEBCC5db754604a9D951A515c4987141"
		}
	},
	{
		slug: "football_club",
		name: "Club Atletico Estrella",
		description: "Gobernanza comunitaria y rendición de cuentas para proyectos especiales de la comunidad del club.",
		nftImage: "/nft/football_club.webp",
		membershipDisplayTokenId: 1,
		addresses: {
			governance: (import.meta.env.VITE_ORG_3_GOVERNANCE as `0x${string}`) || "0xbad4C9b442E550dF9D119fB6166CF0Ecb472f624"
		}
	}
];

export function getAllOrgs(): OrgConfig[] {
	return DEFAULT_ORGS;
}

export function getOrg(slug: string): OrgConfig | undefined {
	return DEFAULT_ORGS.find((org) => org.slug === slug);
}
