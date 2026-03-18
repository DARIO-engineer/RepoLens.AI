import { getAiAvailability } from "./serviceState.js";

export function applyApiHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
}

export function buildAiUnavailablePayload(lang = "en", availability = getAiAvailability()) {
    const retryAfterSeconds = availability.retryAfterSeconds || 0;
    const retryAfterMinutes = retryAfterSeconds
        ? Math.max(1, Math.ceil(retryAfterSeconds / 60))
        : null;

    if (lang === "pt") {
        return {
            error: "Serviço temporariamente indisponível",
            code: "AI_TEMPORARILY_UNAVAILABLE",
            message: "As quotas da IA foram atingidas. O campo de URL foi desativado temporariamente para evitar novas falhas.",
            hint: retryAfterMinutes
                ? `Volte a tentar dentro de cerca de ${retryAfterMinutes} minuto(s).`
                : "Volte a tentar mais tarde.",
            serviceUnavailable: {
                ...availability,
                placeholder: "Site temporariamente indisponível, volte mais tarde.",
            },
        };
    }

    return {
        error: "Service temporarily unavailable",
        code: "AI_TEMPORARILY_UNAVAILABLE",
        message: "The AI quota has been exhausted. The repository URL field was temporarily disabled to prevent repeated failures.",
        hint: retryAfterMinutes
            ? `Please try again in about ${retryAfterMinutes} minute(s).`
            : "Please try again later.",
        serviceUnavailable: {
            ...availability,
            placeholder: "Site temporarily unavailable, please try again later.",
        },
    };
}
