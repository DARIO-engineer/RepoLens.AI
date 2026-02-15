import { GitHubService } from "../server/services/github.js";
import { GeminiService } from "../server/services/gemini.js";

const githubService = new GitHubService();
const geminiService = new GeminiService();

export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    let repoData;
    let languages;
    let readmeContent = "";
    const lang = req.body?.lang || "en";

    try {
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ error: "repoUrl is required." });
        }

        // Fetch all GitHub data in parallel
        const repoInfo = await githubService.getRepositoryInfo(repoUrl);
        repoData = repoInfo.repoData;
        languages = repoInfo.languages;
        readmeContent = repoInfo.readmeContent;

        // Build prompt and generate AI analysis
        const prompt = geminiService.buildPrompt(
            repoData,
            languages,
            readmeContent,
            repoInfo.tree,
            lang
        );
        const analysis = await geminiService.generateAnalysis(prompt, lang);

        return res.json({ analysis });
    } catch (error) {
        const statusCode = error.status || error.response?.status;
        const fallbackReason =
            error?.response?.data?.error?.status ||
            statusCode ||
            error?.message ||
            "internal error";

        console.error("[analyze] Error:", {
            message: error.message,
            statusCode,
            responseStatus: error.response?.status,
        });

        // Use fallback analysis if we have partial data
        const useFallback =
            [401, 403, 404, 429, 500].includes(statusCode) ||
            String(error?.message || "").toLowerCase().includes("quota") ||
            String(error?.message || "").toLowerCase().includes("gemini");

        if (useFallback && repoData && languages) {
            const fallbackAnalysis = geminiService.buildFallbackAnalysis(
                repoData,
                languages,
                readmeContent,
                String(fallbackReason),
                lang
            );
            return res.json({ analysis: fallbackAnalysis });
        }

        const status = statusCode || 500;
        const details =
            error.response?.data ||
            error.error?.message ||
            error.cause?.message ||
            error.message ||
            "Internal error";

        return res.status(status).json({
            error: "Error analyzing repository",
            details,
        });
    }
}
