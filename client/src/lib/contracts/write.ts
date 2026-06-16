import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import type { Address } from "viem";
import { wagmiConfig } from "$lib/web3/appkit";
import { contractAddresses } from "./addresses";
import { membershipAbi } from "./abis/membership";
import { treasuryAbi } from "./abis/treasury";
import { governanceAbi } from "./abis/governance";

function requireConfig() {
	if (!wagmiConfig) throw new Error("Wallet not initialized. Set VITE_REOWN_PROJECT_ID.");
	return wagmiConfig;
}

export async function payPendingContribution(amount: bigint) {
	const hash = await writeContract(requireConfig(), {
		address: contractAddresses.treasury,
		abi: treasuryAbi,
		functionName: "payAllPendingContribution",
		value: amount
	});

	return waitForTransactionReceipt(requireConfig(), { hash });
}

export async function voteOnProposal(proposalId: bigint, support: boolean) {
	const hash = await writeContract(requireConfig(), {
		address: contractAddresses.governance,
		abi: governanceAbi,
		functionName: "vote",
		args: [proposalId, support]
	});

	return waitForTransactionReceipt(requireConfig(), { hash });
}

export async function executeProposal(proposalId: bigint) {
	const hash = await writeContract(requireConfig(), {
		address: contractAddresses.governance,
		abi: governanceAbi,
		functionName: "executeProposal",
		args: [proposalId]
	});

	return waitForTransactionReceipt(requireConfig(), { hash });
}

export async function mintMember(to: Address, dni: string, fullName: string) {
	const hash = await writeContract(requireConfig(), {
		address: contractAddresses.membership,
		abi: membershipAbi,
		functionName: "mint",
		args: [to, { dni, fullName }]
	});

	return waitForTransactionReceipt(requireConfig(), { hash });
}

export async function requestContribution(contributor: Address, amount: bigint) {
	const hash = await writeContract(requireConfig(), {
		address: contractAddresses.treasury,
		abi: treasuryAbi,
		functionName: "requestContribution",
		args: [contributor, amount]
	});

	return waitForTransactionReceipt(requireConfig(), { hash });
}

export async function registerContributor(
	to: Address,
	dni: string,
	fullName: string,
	contributionAmount: bigint
) {
	await mintMember(to, dni, fullName);
	return requestContribution(to, contributionAmount);
}

export async function createProposal(description: string, amount: bigint) {
	const hash = await writeContract(requireConfig(), {
		address: contractAddresses.governance,
		abi: governanceAbi,
		functionName: "createProposal",
		args: [description, amount]
	});

	return waitForTransactionReceipt(requireConfig(), { hash });
}