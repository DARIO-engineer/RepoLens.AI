import express from "express";
import { GitHubService } from "../services/github.js";
import { GeminiService } from "../services/gemini.js";

const router = express.Router();
const githubService = new GitHubService();
const geminiService = new GeminiService();

router.post("/", async (req, res) => {
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
        const prompt = geminiService.buildPrompt(repoData, languages, readmeContent, repoInfo.tree, lang);
        const analysis = await geminiService.generateAnalysis(prompt, lang);

        return res.json({ analysis });
    } catch (error) {
        const statusCode = error.status || error.response?.status;
        const fallbackReason =
            error?.response?.data?.error?.status ||
            statusCode ||
            error?.message ||
            "erro interno";

        console.error("[analyze] Error caught:", {
            message: error.message,
            statusCode,
            responseStatus: error.response?.status,
            responseData: JSON.stringify(error.response?.data || {}).slice(0, 500),
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
            "Erro interno";

        console.error("Erro em /analyze:", {
            status,
            details,
            code: error.code,
            name: error.name,
        });

        return res.status(status).json({
            error: "Erro ao analisar repositório",
            details,
            hint: getErrorHint(status),
        });
    }
});

function getErrorHint(status) {
    switch (status) {
        case 401:
            return "Verifique GEMINI_API_KEY no server/.env.";
        case 403:
            return "Acesso negado na API (GitHub ou Gemini). Verifique as credenciais.";
        case 429:
            return "Limite de requisições atingido. Aguarde e tente novamente.";
        case 400:
            return "Falha na solicitação para a API (URL inválida, repo inacessível ou prompt muito grande).";
        case 404:
            return "Modelo Gemini indisponível para sua chave/API. Ajuste GEMINI_MODEL ou habilite modelos no projeto.";
        default:
            return undefined;
    }
}

export default router;
