import { getAllOrgs } from "$lib/config/orgs";
import { getOrgMembershipNftImage, type DiscoverOrg } from "$lib/contracts/nft";

export const load = async ({ url, fetch }) => {
	const orgs = getAllOrgs();

	const discoverOrgs: DiscoverOrg[] = await Promise.all(
		orgs.map(async (org) => ({
			...org,
			nftImageUrl: await getOrgMembershipNftImage(org, url.origin, fetch)
		}))
	);

	return { orgs: discoverOrgs };
};