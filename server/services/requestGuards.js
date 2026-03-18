const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.MAX_REQUESTS_PER_MINUTE) || 15;
const MAX_CONCURRENT_PER_IP = Number(process.env.MAX_CONCURRENT_REQUESTS_PER_IP) || 2;

const requestsByIp = new Map();
const activeRequestsByIp = new Map();

function pruneOldRequests(now, entries = []) {
    return entries.filter((timestamp) => now - timestamp < WINDOW_MS);
}

export function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];

    if (Array.isArray(forwarded) && forwarded.length > 0) {
        return String(forwarded[0]).split(",")[0].trim();
    }

    if (typeof forwarded === "string" && forwarded.length > 0) {
        return forwarded.split(",")[0].trim();
    }

    return (
        req.ip ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        "unknown"
    );
}

export function acquireRequestGuard(req) {
    const now = Date.now();
    const ip = getClientIp(req);
    const recentRequests = pruneOldRequests(now, requestsByIp.get(ip));

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        requestsByIp.set(ip, recentRequests);
        return {
            ok: false,
            status: 429,
            payload: {
                error: "Too many requests",
                code: "RATE_LIMITED",
                hint: "Tente novamente em alguns instantes.",
            },
        };
    }

    const activeRequests = activeRequestsByIp.get(ip) || 0;
    if (activeRequests >= MAX_CONCURRENT_PER_IP) {
        return {
            ok: false,
            status: 429,
            payload: {
                error: "Too many concurrent requests",
                code: "TOO_MANY_CONCURRENT_REQUESTS",
                hint: "Aguarde a análise atual terminar antes de iniciar outra.",
            },
        };
    }

    recentRequests.push(now);
    requestsByIp.set(ip, recentRequests);
    activeRequestsByIp.set(ip, activeRequests + 1);

    return {
        ok: true,
        release: () => {
            const currentActive = activeRequestsByIp.get(ip) || 0;
            if (currentActive <= 1) {
                activeRequestsByIp.delete(ip);
                return;
            }

            activeRequestsByIp.set(ip, currentActive - 1);
        },
    };
}
