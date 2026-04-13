import { GitHubService } from "../services/github.js";
import { GeminiService } from "../services/gemini.js";
import { buildAiUnavailablePayload } from "../services/apiResponses.js";
import { acquireRequestGuard } from "../services/requestGuards.js";
import { getAiAvailability, markAiUnavailable } from "../services/serviceState.js";

const githubService = new GitHubService();
const geminiService = new GeminiService();

function getErrorHint(status) {
    switch (status) {
        case 400:
            return "Use uma URL pública válida do GitHub no formato https://github.com/owner/repo.";
        case 401:
            return "Verifique as credenciais configuradas no backend.";
        case 403:
            return "Acesso negado pela API. Verifique as credenciais e permissões.";
        case 404:
            return "Repositório ou recurso não encontrado.";
        case 408:
            return "A análise demorou demasiado tempo. Tente novamente.";
        case 413:
            return "A solicitação excede o limite permitido.";
        case 429:
            return "Muitas tentativas em pouco tempo. Aguarde antes de tentar de novo.";
        default:
            return "Tente novamente mais tarde.";
    }
}

function sanitizeErrorDetails(error) {
    const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Internal error";

    return String(message).slice(0, 240);
}

function parseRetryAfterMs(error) {
    const retryAfterHeader = error?.response?.headers?.["retry-after"];
    const seconds = Number(retryAfterHeader);

    if (Number.isFinite(seconds) && seconds > 0) {
        return seconds * 1000;
    }

    return undefined;
}

function isAiProviderError(error) {
    const requestUrl = String(error?.config?.url || error?.response?.config?.url || "");
    const providerMessage = String(
        error?.response?.data?.error?.message ||
        error?.message ||
        ""
    ).toLowerCase();

    return (
        requestUrl.includes("generativelanguage.googleapis.com") ||
        providerMessage.includes("gemini") ||
        providerMessage.includes("claude") ||
        providerMessage.includes("anthropic") ||
        providerMessage.includes("openai")
    );
}

function isAiQuotaError(error) {
    const statusCode = error?.status || error?.response?.status;
    const providerMessage = String(
        error?.response?.data?.error?.message ||
        error?.message ||
        ""
    ).toLowerCase();
    const providerStatus = String(error?.response?.data?.error?.status || "").toLowerCase();
    const hasQuotaSignal =
        providerStatus.includes("quota") ||
        providerMessage.includes("quota") ||
        providerMessage.includes("exceeded your current quota") ||
        providerMessage.includes("billing");
    const isResourceExhaustedQuotaLike =
        providerStatus.includes("resource_exhausted") &&
        (
            providerMessage.includes("quota") ||
            providerMessage.includes("billing") ||
            providerMessage.includes("daily limit") ||
            providerMessage.includes("per day")
        );

    return (
        isAiProviderError(error) &&
        (hasQuotaSignal || isResourceExhaustedQuotaLike || (statusCode === 429 && hasQuotaSignal))
    );
}

export async function analyzeRepository(req, res) {
    const lang = req.body?.lang === "pt" ? "pt" : "en";
    const availability = getAiAvailability();

    if (!availability.available) {
        return res.status(503).json(buildAiUnavailablePayload(lang, availability));
    }

    const guard = acquireRequestGuard(req);
    if (!guard.ok) {
        return res.status(guard.status).json(guard.payload);
    }

    let repoData;
    let languages;
    let readmeContent = "";

    try {
        const { repoUrl } = req.body || {};

        if (!repoUrl || typeof repoUrl !== "string") {
            return res.status(400).json({
                error: "repoUrl is required.",
                code: "INVALID_REPOSITORY_URL",
                hint: getErrorHint(400),
            });
        }

        const repoInfo = await githubService.getRepositoryInfo(repoUrl);
        repoData = repoInfo.repoData;
        languages = repoInfo.languages;
        readmeContent = repoInfo.readmeContent;

        const prompt = geminiService.buildPrompt(
            repoData,
            languages,
            readmeContent,
            repoInfo.tree,
            lang
        );
        const analysis = await geminiService.generateAnalysis(prompt, lang);

        return res.json({
            analysis,
            serviceUnavailable: null,
        });
    } catch (error) {
        const statusCode = error.status || error.response?.status || 500;

        console.error("[analyze] Error caught:", {
            message: error.message,
            statusCode,
            responseStatus: error.response?.status,
            responseData: JSON.stringify(error.response?.data || {}).slice(0, 500),
        });

        if (isAiQuotaError(error)) {
            const unavailableState = markAiUnavailable({
                reason: "quota_exceeded",
                provider: "AI",
                retryAfterMs: parseRetryAfterMs(error),
            });
            return res.status(503).json(buildAiUnavailablePayload(lang, unavailableState));
        }

        const useFallback =
            isAiProviderError(error) &&
            repoData &&
            languages &&
            [401, 403, 404, 408, 429, 500, 502, 503, 504].includes(statusCode);

        if (useFallback) {
            const fallbackReason =
                error?.response?.data?.error?.status ||
                error?.message ||
                "internal error";

            const fallbackAnalysis = geminiService.buildFallbackAnalysis(
                repoData,
                languages,
                readmeContent,
                String(fallbackReason),
                lang
            );

            return res.json({
                analysis: fallbackAnalysis,
                fallback: true,
                serviceUnavailable: null,
            });
        }

        return res.status(statusCode).json({
            error: lang === "pt" ? "Erro ao analisar repositório" : "Error analyzing repository",
            code: error.code || "ANALYZE_FAILED",
            details: sanitizeErrorDetails(error),
            hint: getErrorHint(statusCode),
        });
    } finally {
        guard.release?.();
    }
}
