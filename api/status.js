import { applyApiHeaders, buildAiUnavailablePayload } from "../server/services/apiResponses.js";
import { getAiAvailability } from "../server/services/serviceState.js";

export default function handler(req, res) {
    applyApiHeaders(res);

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const lang = req.query?.lang === "pt" ? "pt" : "en";
    const availability = getAiAvailability();

    if (availability.available) {
        return res.status(200).json({
            ok: true,
            serviceUnavailable: null,
        });
    }

    return res.status(503).json(buildAiUnavailablePayload(lang, availability));
}
