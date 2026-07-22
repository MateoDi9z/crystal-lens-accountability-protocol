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

	if (
		lower.includes("not an active member") ||
		lower.includes("not a member") ||
		lower.includes("only members")
	) {
		return "La cuenta ingresada no es un miembro activo de esta organización.";
	}
	if (lower.includes("already member") || lower.includes("already a member") || lower.includes("alreadycontributor")) {
		return "Esta cuenta ya se encuentra registrada como miembro de la organización.";
	}
	if (lower.includes("ownableunauthorizedaccount") || lower.includes("unauthorizedaccount")) {
		return "No tenés permisos de administrador para ejecutar esta acción.";
	}
	if (lower.includes("pendingdebtremaining") || lower.includes("pending debt")) {
		return "No se puede realizar la acción porque hay un aporte o deuda pendiente sin saldar.";
	}
	if (lower.includes("user rejected") || lower.includes("user denied")) {
		return "Cancelaste la operación en tu billetera.";
	}
	if (lower.includes("insufficient funds")) {
		return "No tenés suficiente ETH en tu billetera para cubrir la transacción y el gas.";
	}
	if (
		lower.includes("chainmismatch") ||
		(lower.includes("does not match") && lower.includes("chain"))
	) {
		return "La red seleccionada en tu billetera no coincide con la red configurada.";
	}
	if (lower.includes("switch network") || lower.includes("switch_chain")) {
		return "No se pudo cambiar de red automáticamente. Cambiá la red desde tu billetera.";
	}
	if (lower.includes("not connected") || lower.includes("connector not connected")) {
		return "No hay billetera conectada. Volvé a conectar tu billetera e intentá de nuevo.";
	}
	if (lower.includes("amount is not the same") || lower.includes("pending contribution")) {
		return "El monto ingresado no coincide con la contribución pendiente.";
	}
	if (lower.includes("proposal is not approved")) {
		return "Esta propuesta aún no está aprobada para ejecutarse.";
	}
	if (lower.includes("insufficient active funds")) {
		return "La tesorería no tiene fondos suficientes para transferir este monto.";
	}
	if (lower.includes("proposal does not exist")) {
		return "No encontramos esta propuesta de decisión.";
	}
	if (lower.includes("execution reverted") || lower.includes("revert")) {
		const revertMatch = message.match(/reason:\s*([^|]+)/i) || message.match(/revert:\s*([^|]+)/i);
		if (revertMatch?.[1]) {
			const cleanReason = revertMatch[1].split(/\.\s*Raw Call Arguments|Details:|Version:/i)[0].trim();
			return `La transacción fue rechazada: ${cleanReason}`;
		}
		return "La transacción fue rechazada por el contrato inteligente.";
	}
	if (lower.includes("gas") || lower.includes("estimation")) {
		return "No se pudo estimar el gas de la transacción. Verificá que los datos ingresados sean válidos.";
	}

	if (import.meta.env.DEV && message) {
		return `Error de transacción: ${message.slice(0, 300)}`;
	}

	return "No se pudo completar la transacción. Intentá de nuevo en unos momentos.";
}