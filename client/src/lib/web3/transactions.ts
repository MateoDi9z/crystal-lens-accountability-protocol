import { getConnections, sendTransaction, writeContract } from "@wagmi/core";
import type { Connector } from "@wagmi/core";
import { encodeFunctionData, numberToHex, type Abi, type Address, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { getWagmiConfig } from "./appkit";
import { ensureSepoliaForWrite, SEPOLIA_CHAIN_ID } from "./chain";

const AUTH_CONNECTOR_ID = "AUTH";

type Eip1193Provider = {
	request: (args: { method: string; params?: unknown[] }) => Promise<Hex>;
};

function isAuthConnector(connector: { id?: string; type?: string } | undefined) {
	return connector?.id === AUTH_CONNECTOR_ID || connector?.type === AUTH_CONNECTOR_ID;
}

function resolveConnector(
	connector: Connector | undefined,
	config: ReturnType<typeof getWagmiConfig>
): Connector | undefined {
	if (connector) return connector;

	const connections = getConnections(config);
	return connections.find((connection) => isAuthConnector(connection.connector))?.connector;
}

async function sendAuthTransaction(
	connector: Connector,
	from: Address,
	tx: { to: Address; data: Hex; value: bigint }
): Promise<`0x${string}`> {
	const provider = (await connector.getProvider()) as Eip1193Provider | undefined;

	if (!provider?.request) {
		throw new Error("No se pudo obtener el provider de la billetera embebida.");
	}

	const hash = await provider.request({
		method: "eth_sendTransaction",
		params: [
			{
				from,
				to: tx.to,
				data: tx.data,
				value: numberToHex(tx.value)
			}
		]
	});

	return hash;
}

export async function executeContractTransaction(params: {
	address: Address;
	abi: Abi;
	functionName: string;
	args?: readonly unknown[];
	value?: bigint;
}): Promise<`0x${string}`> {
	const config = getWagmiConfig();
	const account = await ensureSepoliaForWrite();

	if (!account.address) {
		throw new Error("Conectá tu billetera para continuar.");
	}

	const connector = resolveConnector(account.connector, config);
	const value = params.value ?? 0n;
	const data = encodeFunctionData({
		abi: params.abi,
		functionName: params.functionName,
		args: params.args ?? []
	});

	if (isAuthConnector(connector) && connector) {
		try {
			return await sendAuthTransaction(connector, account.address, {
				to: params.address,
				data,
				value
			});
		} catch (authError) {
			try {
				return await sendTransaction(config, {
					to: params.address,
					data,
					value,
					account: account.address,
					connector,
					chainId: SEPOLIA_CHAIN_ID,
					chain: sepolia
				});
			} catch {
				throw authError;
			}
		}
	}

	return writeContract(config, {
		address: params.address,
		abi: params.abi,
		functionName: params.functionName,
		args: params.args,
		value,
		account: account.address,
		connector,
		chainId: SEPOLIA_CHAIN_ID,
		chain: sepolia
	});
}