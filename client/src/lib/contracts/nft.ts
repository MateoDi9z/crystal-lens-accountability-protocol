import { publicClient } from "$lib/web3/client";
import { membershipAbi } from "./abi";
import { resolveOrgAddresses } from "./read";
import type { OrgConfig } from "$lib/config/orgs";

export interface DiscoverOrg extends OrgConfig {
	nftImageUrl: string | null;
}

const DEFAULT_DISPLAY_TOKEN_ID = 1;
const SCAN_FALLBACK_MAX = 8;

interface NftMetadata {
	image?: string;
}

export function resolveResourceUrl(uri: string, baseUrl?: string): string {
	if (!uri) return uri;
	if (uri.startsWith("/") && baseUrl) {
		return `${baseUrl.replace(/\/$/, "")}${uri}`;
	}
	if (uri.startsWith("ipfs://")) {
		return `https://ipfs.io/ipfs/${uri.slice(7)}`;
	}
	if (uri.startsWith("ar://")) {
		return `https://arweave.net/${uri.slice(5)}`;
	}
	if (uri.startsWith("data:")) {
		return uri;
	}
	return uri;
}

async function fetchMetadataImage(
	tokenUri: string,
	baseUrl: string | undefined,
	kitFetch: typeof fetch
): Promise<string | null> {
	const metadataUrl = resolveResourceUrl(tokenUri, baseUrl);
	const response = await kitFetch(metadataUrl);

	if (!response.ok) {
		throw new Error(`No se pudo leer metadata (${response.status})`);
	}

	const metadata = (await response.json()) as NftMetadata;
	if (!metadata.image) return null;

	return resolveResourceUrl(metadata.image, baseUrl);
}

async function readTokenUri(membership: `0x${string}`, tokenId: number): Promise<string | null> {
	try {
		const uri = await publicClient.readContract({
			address: membership,
			abi: membershipAbi,
			functionName: "tokenURI",
			args: [BigInt(tokenId)]
		});
		return uri.length > 0 ? uri : null;
	} catch {
		return null;
	}
}

async function fetchStaticFallbackImage(
	org: OrgConfig,
	baseUrl: string | undefined,
	kitFetch: typeof fetch
): Promise<string | null> {
	try {
		return await fetchMetadataImage(`/nft/${org.slug}.json`, baseUrl, kitFetch);
	} catch {
		return null;
	}
}

/**
 * Imagen de la colección membership para mostrar en Discover.
 * Lee tokenURI on-chain (ERC-721) y resuelve el campo `image` del JSON de metadata.
 * Debe llamarse desde un `load` de SvelteKit pasando su `fetch`.
 */
export async function getOrgMembershipNftImage(
	org: OrgConfig,
	baseUrl: string | undefined,
	kitFetch: typeof fetch
): Promise<string | null> {
	try {
		const { membership } = await resolveOrgAddresses(org);
		const preferredTokenId = org.membershipDisplayTokenId ?? DEFAULT_DISPLAY_TOKEN_ID;

		const preferredUri = await readTokenUri(membership, preferredTokenId);
		if (preferredUri) {
			try {
				const image = await fetchMetadataImage(preferredUri, baseUrl, kitFetch);
				if (image) return image;
			} catch {
				// tokenURI on-chain inválido o metadata inaccesible
			}
		}

		for (let tokenId = 1; tokenId <= SCAN_FALLBACK_MAX; tokenId++) {
			if (tokenId === preferredTokenId) continue;
			const uri = await readTokenUri(membership, tokenId);
			if (!uri) continue;
			try {
				const image = await fetchMetadataImage(uri, baseUrl, kitFetch);
				if (image) return image;
			} catch {
				continue;
			}
		}

		return fetchStaticFallbackImage(org, baseUrl, kitFetch);
	} catch {
		return fetchStaticFallbackImage(org, baseUrl, kitFetch);
	}
}