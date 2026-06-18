function collectErrorText(error: unknown): string {
	const parts: string[] = [];
	let current: unknown = error;
	let depth = 0;

	while (current && depth < 6) {
		if (typeof current === "string") {
			parts.push(current);
			break;
		}

		if (current instanceof Error) {
			parts.push(current.message);
			const extra = current as Error & { shortMessage?: string; details?: string; reason?: string };
			if (extra.shortMessage) parts.push(extra.shortMessage);
			if (extra.details) parts.push(extra.details);
			if (extra.reason) parts.push(extra.reason);
			current = current.cause;
		} else if (typeof current === "object" && current) {
			const obj = current as {
				message?: string;
				shortMessage?: string;
				details?: string;
				reason?: string;
				cause?: unknown;
			};
			if (obj.message) parts.push(obj.message);
			if (obj.shortMessage) parts.push(obj.shortMessage);
			if (obj.details) parts.push(obj.details);
			if (obj.reason) parts.push(obj.reason);
			current = obj.cause;
		} else {
			parts.push(String(current));
			break;
		}

		depth++;
	}

	return parts.filter(Boolean).join(" | ");
}

function resolveDisplayMessage(error: unknown): string {
	const message = collectErrorText(error);
	const lower = message.toLowerCase();

	if (lower.includes("an error occurred") && error instanceof Error && error.cause) {
		const causeMessage = collectErrorText(error.cause);
		if (causeMessage && !causeMessage.toLowerCase().includes("an error occurred")) {
			return causeMessage;
		}
	}

	return message;
}

export function parseWalletError(error: unknown): string {
	const message = resolveDisplayMessage(error);
	const lower = message.toLowerCase();

	if (lower.includes("user rejected") || lower.includes("user denied")) {
		return "Cancelaste la operación en tu billetera.";
	}
	if (lower.includes("insufficient funds")) {
		return "No tenés suficiente Sepolia ETH para pagar. Conseguí ETH de prueba en un faucet.";
	}
	if (
		lower.includes("chainmismatch") ||
		(lower.includes("does not match") && lower.includes("chain"))
	) {
		return "No pudimos cambiar a Sepolia. Abrí el selector de red de Reown, elegí Sepolia e intentá de nuevo.";
	}
	if (lower.includes("switch network") || lower.includes("switch_chain")) {
		return "No se pudo cambiar a Sepolia. Usá el botón de red de Reown para seleccionar Sepolia.";
	}
	if (lower.includes("not connected") || lower.includes("connector not connected")) {
		return "No hay billetera conectada. Volvé a iniciar sesión e intentá de nuevo.";
	}
	if (lower.includes("not a member") || lower.includes("only members")) {
		return "Tu cuenta no está registrada como miembro de esta organización.";
	}
	if (lower.includes("amount is not the same") || lower.includes("pending contribution")) {
		return "El monto no coincide con tu contribución pendiente. Recargá la página e intentá de nuevo.";
	}
	if (lower.includes("execution reverted") || lower.includes("revert")) {
		const revertMatch = message.match(/reason:\s*([^|]+)/i);
		if (revertMatch?.[1]) {
			return `La transacción fue rechazada: ${revertMatch[1].trim()}`;
		}
		return "El contrato rechazó la transacción. Verificá que seas miembro y que el monto sea correcto.";
	}
	if (lower.includes("gas") || lower.includes("estimation")) {
		return "No se pudo estimar el gas de la transacción. Reintentá en unos segundos.";
	}

	if (import.meta.env.DEV && message) {
		console.error("Wallet error:", error);
		return `Error al pagar: ${message.slice(0, 400)}`;
	}

	return "Algo salió mal al procesar el pago. Intentá de nuevo.";
}