const DEFAULT_OUTAGE_WINDOW_MS = 15 * 60 * 1000;

const state = {
    aiUnavailableUntil: 0,
    reason: "",
    provider: "AI",
};

function normalizeRetryAfterMs(retryAfterMs) {
    if (!Number.isFinite(retryAfterMs) || retryAfterMs <= 0) {
        return Number(process.env.AI_OUTAGE_WINDOW_MS) || DEFAULT_OUTAGE_WINDOW_MS;
    }

    return Math.max(retryAfterMs, 60 * 1000);
}

export function markAiUnavailable({ reason = "quota_exceeded", provider = "AI", retryAfterMs } = {}) {
    state.aiUnavailableUntil = Date.now() + normalizeRetryAfterMs(retryAfterMs);
    state.reason = reason;
    state.provider = provider;
    return getAiAvailability();
}

export function clearAiUnavailable() {
    state.aiUnavailableUntil = 0;
    state.reason = "";
    state.provider = "AI";
}

export function getAiAvailability() {
    if (state.aiUnavailableUntil && state.aiUnavailableUntil <= Date.now()) {
        clearAiUnavailable();
    }

    const retryAfterMs = Math.max(0, state.aiUnavailableUntil - Date.now());

    return {
        available: retryAfterMs === 0,
        reason: state.reason,
        provider: state.provider,
        until: state.aiUnavailableUntil || null,
        retryAfterMs,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
}
