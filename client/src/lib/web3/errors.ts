export function parseWalletError(error: unknown): string {
	const message =
		error instanceof Error
			? error.message
			: typeof error === "object" && error && "shortMessage" in error
				? String((error as { shortMessage: string }).shortMessage)
				: String(error);

	const lower = message.toLowerCase();

	if (lower.includes("user rejected") || lower.includes("user denied")) {
		return "Cancelaste la operación en tu billetera.";
	}
	if (lower.includes("insufficient funds")) {
		return "No tenés suficiente Sepolia ETH para pagar. Conseguí ETH de prueba en un faucet.";
	}
	if (lower.includes("chain") || lower.includes("network")) {
		return "Tu billetera no está en Sepolia. Cambiá la red e intentá de nuevo.";
	}
	if (lower.includes("not a member") || lower.includes("onlymember")) {
		return "Tu cuenta no está registrada como miembro de esta organización.";
	}
	if (lower.includes("amount is not the same")) {
		return "El monto no coincide con tu contribución pendiente. Recargá la página e intentá de nuevo.";
	}

	return "Algo salió mal al procesar el pago. Intentá de nuevo.";
}