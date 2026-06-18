import { getActiveWalletClient, publicClient } from "$lib/web3/client";
import { resolveOrgAddresses } from "./read";
import { governanceAbi, treasuryAbi, membershipAbi } from "./abi";
import { getActiveOrg } from "$lib/stores/dashboard.svelte";
import type { OrgConfig } from "$lib/config/orgs";
import type { Address } from "viem";

function resolveOrg(org?: OrgConfig): OrgConfig {
	const resolved = org ?? getActiveOrg();
	if (!resolved) throw new Error("No hay organización seleccionada");
	return resolved;
}

export async function payPendingContribution(amount: bigint, org?: OrgConfig) {
	const activeOrg = resolveOrg(org);
	const { treasury } = await resolveOrgAddresses(activeOrg);

	const walletClient = await getActiveWalletClient();
	if (!walletClient) throw new Error("Conectá tu billetera para continuar.");
	const [address] = await walletClient.getAddresses();

	const hash = await walletClient.writeContract({
		address: treasury,
		abi: treasuryAbi,
		functionName: "payAllPendingContribution",
		account: address,
		value: amount
	});
	return hash;
}

export async function confirmTransaction(hash: `0x${string}`) {
	return publicClient.waitForTransactionReceipt({ hash });
}

export async function registerContributor(to: Address, dni: string, fullName: string, amount: bigint) {
	const org = getActiveOrg();
	if (!org) throw new Error("No active organization");
	const { membership, treasury } = await resolveOrgAddresses(org);

	const walletClient = await getActiveWalletClient();
	if (!walletClient) throw new Error("Conectá tu billetera para continuar.");
	const [address] = await walletClient.getAddresses();

	// 1. Mint membership NFT
	const mintHash = await walletClient.writeContract({
		address: membership,
		abi: membershipAbi,
		functionName: "mint",
		args: [to, { dni, fullName }],
		account: address
	});
	await publicClient.waitForTransactionReceipt({ hash: mintHash });

	// 2. Request initial contribution debt
	const debtHash = await walletClient.writeContract({
		address: treasury,
		abi: treasuryAbi,
		functionName: "requestContribution",
		args: [to, amount],
		account: address
	});
	return publicClient.waitForTransactionReceipt({ hash: debtHash });
}

export async function requestContribution(contributor: Address, amount: bigint) {
	const org = getActiveOrg();
	if (!org) throw new Error("No active organization");
	const { treasury } = await resolveOrgAddresses(org);

	const walletClient = await getActiveWalletClient();
	if (!walletClient) throw new Error("Conectá tu billetera para continuar.");
	const [address] = await walletClient.getAddresses();

	const hash = await walletClient.writeContract({
		address: treasury,
		abi: treasuryAbi,
		functionName: "requestContribution",
		args: [contributor, amount],
		account: address
	});
	return publicClient.waitForTransactionReceipt({ hash });
}

export async function createProposal(description: string, amount: bigint) {
	const org = getActiveOrg();
	if (!org) throw new Error("No active organization");
	const { governance } = await resolveOrgAddresses(org);

	const walletClient = await getActiveWalletClient();
	if (!walletClient) throw new Error("Conectá tu billetera para continuar.");
	const [address] = await walletClient.getAddresses();

	const hash = await walletClient.writeContract({
		address: governance,
		abi: governanceAbi,
		functionName: "createProposal",
		args: [description, amount],
		account: address
	});
	return publicClient.waitForTransactionReceipt({ hash });
}

export async function voteOnProposal(id: bigint, support: boolean, org?: OrgConfig) {
	const activeOrg = resolveOrg(org);
	const { governance } = await resolveOrgAddresses(activeOrg);

	const walletClient = await getActiveWalletClient();
	if (!walletClient) throw new Error("Conectá tu billetera para continuar.");
	const [address] = await walletClient.getAddresses();

	const hash = await walletClient.writeContract({
		address: governance,
		abi: governanceAbi,
		functionName: "vote",
		args: [id, support],
		account: address
	});
	return publicClient.waitForTransactionReceipt({ hash });
}

export async function executeProposal(id: bigint) {
	const org = getActiveOrg();
	if (!org) throw new Error("No active organization");
	const { governance } = await resolveOrgAddresses(org);

	const walletClient = await getActiveWalletClient();
	if (!walletClient) throw new Error("Conectá tu billetera para continuar.");
	const [address] = await walletClient.getAddresses();

	const hash = await walletClient.writeContract({
		address: governance,
		abi: governanceAbi,
		functionName: "executeProposal",
		args: [id],
		account: address
	});
	return publicClient.waitForTransactionReceipt({ hash });
}
