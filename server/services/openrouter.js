import axios from "axios";

function extractMessageContent(content) {
    if (typeof content === "string") {
        return content.trim();
    }

    if (Array.isArray(content)) {
        return content
            .map((part) => (typeof part === "string" ? part : part?.text || ""))
            .join("\n")
            .trim();
    }

    return "";
}

export class OpenRouterService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY?.trim();
        this.apiUrl = process.env.OPENROUTER_API_URL?.trim() || "https://openrouter.ai/api/v1/chat/completions";
        this.preferredModel = process.env.OPENROUTER_MODEL?.trim();
        const envFallback = String(process.env.OPENROUTER_FALLBACK_MODELS || "")
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean);

        this.modelCandidates = [
            ...(this.preferredModel ? [this.preferredModel] : []),
            ...envFallback,
            "openrouter/auto",
            "anthropic/claude-3.5-sonnet",
            "openai/gpt-4.1-mini",
        ];

        this.http = axios.create({
            timeout: Number(process.env.OPENROUTER_TIMEOUT_MS) || 30000,
            maxContentLength: 2 * 1024 * 1024,
            maxBodyLength: 2 * 1024 * 1024,
            headers: {
                Authorization: this.apiKey ? `Bearer ${this.apiKey}` : "",
                "Content-Type": "application/json",
            },
        });
    }

    isConfigured() {
        return Boolean(this.apiKey);
    }

    isRetryableModelError(error) {
        const status = error?.response?.status;
        const message = String(
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            error?.message ||
            ""
        ).toLowerCase();

        return (
            [400, 408, 429, 500, 502, 503, 504].includes(status) ||
            message.includes("rate limit") ||
            message.includes("temporarily unavailable") ||
            message.includes("overloaded") ||
            message.includes("try again later") ||
            message.includes("no endpoints found") ||
            message.includes("model is not available") ||
            message.includes("invalid model") ||
            message.includes("provider returned error")
        );
    }

    async generateAnalysis(prompt, lang = "en") {
        if (!this.isConfigured()) {
            const err = new Error("OPENROUTER_API_KEY não configurada.");
            err.status = 500;
            err.code = "OPENROUTER_NOT_CONFIGURED";
            throw err;
        }

        const uniqueModels = [...new Set(this.modelCandidates)].filter(Boolean);
        let lastError;

        for (const model of uniqueModels) {
            try {
                const response = await this.http.post(this.apiUrl, {
                    model,
                    messages: [
                        {
                            role: "system",
                            content:
                                lang === "pt"
                                    ? "Você é um arquiteto de software sênior. Entregue análise profunda, concreta e específica do repositório."
                                    : "You are a senior software architect. Deliver deep, concrete, repository-specific technical analysis.",
                        },
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature: 0.35,
                    top_p: 0.9,
                    max_tokens: 4096,
                });

                const content = extractMessageContent(response.data?.choices?.[0]?.message?.content);
                if (content) {
                    return content;
                }

                lastError = new Error(`OpenRouter returned empty content for model ${model}`);
            } catch (error) {
                lastError = error;

                if (this.isRetryableModelError(error)) {
                    continue;
                }

                throw error;
            }
        }

        throw lastError || new Error("No OpenRouter model available");
    }
}

