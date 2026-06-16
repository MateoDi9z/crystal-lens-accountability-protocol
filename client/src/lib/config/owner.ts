import type { Address } from "viem";

export const OWNER_ADDRESS = "0x26583527B405434313EC0A88F629Fb99B42E1e6D" as Address;

export function isOwnerAddress(address?: Address): boolean {
	return address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();
}