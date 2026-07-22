import type { Abi, Address, ContractFunctionArgs, ContractFunctionName } from "viem";
import { publicClient } from "$lib/web3/client";
import { executeContractTransaction } from "$lib/web3/transactions";
import { resolveOrgAddresses } from "./read";
import { governanceAbi, treasuryAbi, membershipAbi } from "./abi";
import { getActiveOrg } from "$lib/stores/dashboard.svelte";
import type { OrgConfig } from "$lib/config/orgs";

function resolveOrg(org?: OrgConfig): OrgConfig {
	const resolved = org ?? getActiveOrg();
	if (!resolved) throw new Error("No hay organización seleccionada");
	return resolved;
}

async function writeWithConnectedWallet<
	TAbi extends Abi,
	TFunctionName extends ContractFunctionName<TAbi, "payable" | "nonpayable">
>(params: {
	address: Address;
	abi: TAbi;
	functionName: TFunctionName;
	args?: ContractFunctionArgs<TAbi, "payable" | "nonpayable", TFunctionName>;
	value?: bigint;
}): Promise<`0x${string}`> {
	return executeContractTransaction({
		address: params.address,
		abi: params.abi,
		functionName: params.functionName,
		args: params.args as readonly unknown[] | undefined,
		value: params.value
	});
}

export async function payPendingContribution(amount: bigint, org?: OrgConfig, payer?: Address) {
	const activeOrg = resolveOrg(org);
	const { treasury } = await resolveOrgAddresses(activeOrg);

	if (payer) {
		await publicClient.simulateContract({
			address: treasury,
			abi: treasuryAbi,
			functionName: "payAllPendingContribution",
			account: payer,
			value: amount
		});
	}

	return writeWithConnectedWallet({
		address: treasury,
		abi: treasuryAbi,
		functionName: "payAllPendingContribution",
		value: amount
	});
}

export async function confirmTransaction(hash: `0x${string}`) {
	const receipt = await publicClient.waitForTransactionReceipt({ hash });
	if (receipt.status === "reverted") {
		try {
			const tx = await publicClient.getTransaction({ hash });
			await publicClient.call({
				to: tx.to,
				data: tx.input,
				value: tx.value,
				account: tx.from,
				blockNumber: receipt.blockNumber > 0n ? receipt.blockNumber - 1n : undefined
			});
		} catch (revertError) {
			throw revertError;
		}
		throw new Error("La transacción fue rechazada en la blockchain (reverted).");
	}
	return receipt;
}

export async function registerContributor(
	to: Address,
	dni: string,
	fullName: string,
	amount: bigint,
	org?: OrgConfig
) {
	const activeOrg = resolveOrg(org);
	const { membership } = await resolveOrgAddresses(activeOrg);

	const hash = await writeWithConnectedWallet({
		address: membership,
		abi: membershipAbi,
		functionName: "registerContributor",
		args: [to, { dni, fullName }, amount]
	});
	return confirmTransaction(hash);
}

export async function requestContribution(contributor: Address, amount: bigint, org?: OrgConfig) {
	const activeOrg = resolveOrg(org);
	const { treasury } = await resolveOrgAddresses(activeOrg);

	const hash = await writeWithConnectedWallet({
		address: treasury,
		abi: treasuryAbi,
		functionName: "requestContribution",
		args: [contributor, amount]
	});
	return confirmTransaction(hash);
}

export async function createProposal(description: string, amount: bigint, org?: OrgConfig) {
	const activeOrg = resolveOrg(org);
	const { governance } = await resolveOrgAddresses(activeOrg);

	const hash = await writeWithConnectedWallet({
		address: governance,
		abi: governanceAbi,
		functionName: "createProposal",
		args: [description, amount]
	});
	return confirmTransaction(hash);
}

export async function voteOnProposal(id: bigint, support: boolean, org?: OrgConfig) {
	const activeOrg = resolveOrg(org);
	const { governance } = await resolveOrgAddresses(activeOrg);

	const hash = await writeWithConnectedWallet({
		address: governance,
		abi: governanceAbi,
		functionName: "vote",
		args: [id, support]
	});
	return confirmTransaction(hash);
}

export async function submitExecuteProposal(id: bigint, org?: OrgConfig) {
	const activeOrg = resolveOrg(org);
	const { governance } = await resolveOrgAddresses(activeOrg);

	return writeWithConnectedWallet({
		address: governance,
		abi: governanceAbi,
		functionName: "executeProposal",
		args: [id]
	});
}

export async function executeProposal(id: bigint, org?: OrgConfig) {
	const hash = await submitExecuteProposal(id, org);
	return confirmTransaction(hash);
}