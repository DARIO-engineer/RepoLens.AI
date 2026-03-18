import { analyzeRepository } from "../server/controllers/analyzeController.js";
import { applyApiHeaders } from "../server/services/apiResponses.js";

export default async function handler(req, res) {
    applyApiHeaders(res);

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    return analyzeRepository(req, res);
}
