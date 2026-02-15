import axios from "axios";

export class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
        this.preferredModel = process.env.GEMINI_MODEL?.trim();
        this.apiVersions = ["v1beta", "v1"];
        this.fallbackModels = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ];
    }

    validateApiKey() {
        if (!this.apiKey) {
            const err = new Error("GEMINI_API_KEY não configurada no server/.env");
            err.status = 500;
            err.hint = "Defina GEMINI_API_KEY e reinicie o backend.";
            throw err;
        }
    }

    async discoverAvailableModels() {
        let discoveredModels = [];

        for (const apiVersion of this.apiVersions) {
            try {
                const listUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${this.apiKey}`;
                const listResponse = await axios.get(listUrl);
                const models = (listResponse.data?.models || [])
                    .filter(
                        (m) =>
                            Array.isArray(m.supportedGenerationMethods) &&
                            m.supportedGenerationMethods.includes("generateContent")
                    )
                    .map((m) => (m.name || "").replace(/^models\//, ""))
                    .filter(Boolean);

                if (models.length) {
                    discoveredModels = models;
                    break;
                }
            } catch {
                // Continue to next API version
            }
        }

        return discoveredModels;
    }

    buildPrompt(repoData, languages, readmeContent, tree, lang = "en") {
        const languageEntries = Object.entries(languages || {});
        const totalBytes = languageEntries.reduce((sum, [, bytes]) => sum + Number(bytes || 0), 0);
        const languageBreakdown = languageEntries
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, bytes]) => {
                const pct = totalBytes ? ((Number(bytes) / totalBytes) * 100).toFixed(1) : "0.0";
                return `${name}: ${pct}%`;
            })
            .join(", ");

        // Keep tree compact — max 60 entries
        const treeSection = tree
            ? `\nRelevant files:\n${tree.split("\n").slice(0, 60).join("\n")}\n`
            : "";

        // Trim README aggressively to leave room for AI output
        const trimmedReadme = (readmeContent || "").slice(0, 4000);

        const langInstruction = lang === "pt"
            ? "Responda em português brasileiro"
            : "YOU MUST respond ENTIRELY in American English. Every word of the analysis content must be in English. Do NOT write any Portuguese";

        const noDesc = lang === "pt" ? "Sem descrição" : "No description";
        const noLang = lang === "pt" ? "Não identificado" : "Not identified";
        const noTopics = lang === "pt" ? "Nenhum" : "None";
        const noLicense = lang === "pt" ? "Não especificada" : "Not specified";
        const unavailable = lang === "pt" ? "Indisponível" : "Unavailable";

        const langPreamble = lang === "pt"
            ? ""
            : "IMPORTANT: Write ALL analysis content in American English. The section KEYS (RESUMO_ARQUITETURAL, PONTOS_FORTES, etc.) must stay as-is, but all descriptions, bullet points, and paragraphs must be in English.\n\n";

        return `${langPreamble}GitHub repository data for analysis:

Name: ${repoData.name}
Description: ${repoData.description || noDesc}
Stars: ${repoData.stargazers_count || 0} | Forks: ${repoData.forks_count || 0} | Issues: ${repoData.open_issues_count || 0}
Languages: ${languageBreakdown || noLang}
Topics: ${repoData.topics?.join(", ") || noTopics}
License: ${repoData.license?.name || noLicense}
${treeSection}
README:
${trimmedReadme || unavailable}

---

Generate COMPLETE technical analysis following EXACTLY the format below. Do NOT add text before the first ##. Do NOT use ### or numbering. Start directly with "## RESUMO_ARQUITETURAL" on the first line.

## RESUMO_ARQUITETURAL
Project X is a Y application that uses Z. The architecture follows the W pattern with components A, B and C that interact via D. [Continue with 2-3 detailed paragraphs about the architecture]

## STACK
- **Frontend**: React, TypeScript, etc.
- **Backend**: Node.js, Express, etc.
- **Database**: PostgreSQL, etc.
- **DevOps**: Docker, GitHub Actions, etc.

## PONTOS_FORTES
- Specific strength with technical justification
- Another strength with evidence
- More points (minimum 4)

## PONTOS_FRACOS
- Specific and constructive weakness
- Another weakness with implicit suggestion
- More points (minimum 4)

## SUGESTOES_MELHORIA
- Concrete suggestion with described impact
- Another suggestion prioritizing feasibility
- More suggestions (minimum 5)

## TAREFAS_INICIANTES
- Specific task: "Add unit tests for module X"
- Another task: "Document the REST API in README"
- More tasks (minimum 5)

CRITICAL RULES:
1. Start DIRECTLY with ## RESUMO_ARQUITETURAL (no text before)
2. Use EXACTLY "## " followed by the name in UPPERCASE with underscores
3. NEVER use ### or #### or "1." or "---"
4. Each section must have at least 4 bullet points or 2 paragraphs
5. Complete ALL 6 sections to the end
6. ${langInstruction}`;
    }

    /**
     * Post-process Gemini output to normalize headers into the expected ## SECTION_KEY format.
     * Handles: ### 1. Resumo Arquitetural, **Resumo Arquitetural**, ## Resumo Arquitetural, etc.
     */
    normalizeAnalysis(text) {
        if (!text) return text;

        // Map of possible variations → canonical key
        const SECTION_MAP = {
            resumo_arquitetural: "RESUMO_ARQUITETURAL",
            resumo: "RESUMO_ARQUITETURAL",
            arquitetural: "RESUMO_ARQUITETURAL",
            arquitetura: "RESUMO_ARQUITETURAL",
            visao_geral: "RESUMO_ARQUITETURAL",
            overview: "RESUMO_ARQUITETURAL",
            stack: "STACK",
            tecnologias: "STACK",
            tech_stack: "STACK",
            stack_tecnologica: "STACK",
            pilha_tecnologica: "STACK",
            pontos_fortes: "PONTOS_FORTES",
            fortes: "PONTOS_FORTES",
            strengths: "PONTOS_FORTES",
            pontos_fracos: "PONTOS_FRACOS",
            fracos: "PONTOS_FRACOS",
            weaknesses: "PONTOS_FRACOS",
            fraquezas: "PONTOS_FRACOS",
            sugestoes_melhoria: "SUGESTOES_MELHORIA",
            sugestoes: "SUGESTOES_MELHORIA",
            melhorias: "SUGESTOES_MELHORIA",
            suggestions: "SUGESTOES_MELHORIA",
            recomendacoes: "SUGESTOES_MELHORIA",
            tarefas_iniciantes: "TAREFAS_INICIANTES",
            tarefas: "TAREFAS_INICIANTES",
            iniciantes: "TAREFAS_INICIANTES",
            good_first_issues: "TAREFAS_INICIANTES",
            beginner_tasks: "TAREFAS_INICIANTES",
        };

        const normalize = (str) =>
            str
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")   // strip accents
                .replace(/[^a-z0-9]+/g, "_")       // non-alphanum → underscore
                .replace(/^_|_$/g, "");             // trim underscores

        // Universal header regex: matches ##, ###, ####, bold, numbered, or combos
        // e.g. "### 1. Resumo Arquitetural", "**Stack Tecnológica**", "## 2 - Pontos Fortes"
        const headerRegex = /^(#{2,4}\s*)?(\d+[\.\)\-]\s*)?(\*{2})?([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s_/\-]+?)(\*{2})?\s*$/;

        const lines = text.split("\n");
        const result = [];
        let usedKeys = new Set();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip --- separators
            if (/^-{3,}$/.test(trimmed)) continue;

            // Try to match as a section header
            const match = trimmed.match(headerRegex);
            if (match) {
                const headerText = match[4].trim();
                const normalizedKey = normalize(headerText);

                // Check if it maps to a known section
                let canonicalKey = null;
                // Direct match
                if (SECTION_MAP[normalizedKey]) {
                    canonicalKey = SECTION_MAP[normalizedKey];
                } else {
                    // Partial match — check if any map key is contained in the normalized text
                    for (const [mapKey, mapVal] of Object.entries(SECTION_MAP)) {
                        if (normalizedKey.includes(mapKey) || mapKey.includes(normalizedKey)) {
                            canonicalKey = mapVal;
                            break;
                        }
                    }
                }

                if (canonicalKey && !usedKeys.has(canonicalKey)) {
                    usedKeys.add(canonicalKey);
                    result.push(`## ${canonicalKey}`);
                    continue;
                }
            }

            // Remove any preamble text before the first ## section
            if (usedKeys.size === 0 && !trimmed.startsWith("## ")) {
                continue; // skip preamble
            }

            result.push(line);
        }

        const normalized = result.join("\n").trim();

        // If normalization stripped everything or didn't find any sections, return original
        if (!normalized || usedKeys.size === 0) {
            return text;
        }

        return normalized;
    }

    async generateAnalysis(prompt, lang = "en") {
        this.validateApiKey();

        const discoveredModels = await this.discoverAvailableModels();

        const modelCandidates = [
            ...(this.preferredModel ? [this.preferredModel] : []),
            ...discoveredModels,
            ...this.fallbackModels,
        ];

        const uniqueModels = [...new Set(modelCandidates)].filter(Boolean);

        let lastError;
        let bestPartialResult = null;
        let bestSectionCount = 0;

        for (const model of uniqueModels) {
            for (const apiVersion of this.apiVersions) {
                try {
                    const geminiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${this.apiKey}`;

                    const requestBody = {
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            topP: 0.95,
                            topK: 40,
                            maxOutputTokens: 8192,
                        },
                    };

                    // systemInstruction is only supported in v1beta
                    if (apiVersion === "v1beta") {
                        const sysLang = lang === "pt"
                            ? "Responda em português brasileiro."
                            : "CRITICAL: Write ALL analysis content in American English. The section header KEYS stay as-is (RESUMO_ARQUITETURAL, PONTOS_FORTES, etc.) but every description, paragraph, and bullet point MUST be in English. Do NOT write any Portuguese text in the content.";
                        requestBody.systemInstruction = {
                            parts: [{ text: `You are a senior software architect who generates technical reports of GitHub repositories. ABSOLUTE RULES: 1) Start the response directly with '## RESUMO_ARQUITETURAL' without ANY text before. 2) Use ONLY headers with '## ' followed by UPPERCASE_WITH_UNDERSCORES. 3) NEVER use ###, ####, numbering (1., 2.), nor --- as separators. 4) Complete ALL 6 mandatory sections with substantial content. 5) ${sysLang}` }]
                        };
                    }

                    const response = await axios.post(geminiUrl, requestBody);

                    const analysis = response.data?.candidates?.[0]?.content?.parts
                        ?.map((part) => part.text || "")
                        .join("\n")
                        .trim();

                    if (analysis) {
                        // Normalize headers into expected ## SECTION_KEY format
                        const normalized = this.normalizeAnalysis(analysis);

                        // Validate completeness — check for required sections
                        const requiredSections = [
                            "RESUMO_ARQUITETURAL",
                            "STACK",
                            "PONTOS_FORTES",
                            "PONTOS_FRACOS",
                            "SUGESTOES_MELHORIA",
                            "TAREFAS_INICIANTES",
                        ];
                        const foundSections = requiredSections.filter((s) =>
                            normalized.includes(`## ${s}`)
                        );
                        const finishReason = response.data?.candidates?.[0]?.finishReason;

                        console.log(`[Gemini] model=${model}, sections=${foundSections.length}/6, finishReason=${finishReason}`);

                        // Track best partial result (normalized)
                        if (foundSections.length > bestSectionCount) {
                            bestSectionCount = foundSections.length;
                            bestPartialResult = normalized;
                        }

                        if (foundSections.length < 3 || finishReason === "MAX_TOKENS") {
                            console.warn(
                                `[Gemini] Incomplete analysis: ${foundSections.length}/6 sections, finishReason=${finishReason}, model=${model}`
                            );
                            // Don't return — try next model for better result
                            lastError = new Error("Incomplete analysis");
                            continue;
                        }

                        return normalized;
                    }
                } catch (err) {
                    lastError = err;
                    const status = err.response?.status;
                    const code = err.response?.data?.error?.code;
                    const message = err.response?.data?.error?.message || "";
                    const isModelNotFound =
                        status === 404 ||
                        code === 404 ||
                        message.includes("not found") ||
                        message.includes("not supported");

                    if (!isModelNotFound) {
                        throw err;
                    }
                }
            }
        }

        // Return best partial result if we got something, even if incomplete
        if (bestPartialResult && bestSectionCount >= 1) {
            console.warn(`[Gemini] Returning best partial result with ${bestSectionCount}/6 sections`);
            return bestPartialResult;
        }

        throw lastError || new Error("No Gemini model available");
    }

    buildFallbackAnalysis(repoData, languages, readmeContent, reason, lang = "en") {
        const languageEntries = Object.entries(languages || {});
        const totalBytes = languageEntries.reduce((sum, [, bytes]) => sum + Number(bytes || 0), 0);
        const languageSummary = languageEntries.length
            ? languageEntries
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([name, bytes]) => {
                      const pct = totalBytes ? ((Number(bytes) / totalBytes) * 100).toFixed(1) : "0.0";
                      return `${name} (${pct}%)`;
                  })
                  .join(", ")
            : lang === "pt" ? "Não identificado" : "Not identified";

        const readmePreview = String(readmeContent || "").slice(0, 1400);
        const topics =
            Array.isArray(repoData?.topics) && repoData.topics.length
                ? repoData.topics.join(", ")
                : lang === "pt" ? "Sem tópicos definidos" : "No topics defined";

        if (lang === "pt") {
            return `
## RESUMO_ARQUITETURAL
Projeto "${repoData?.name || "repositório"}" com estrutura típica inferida a partir de metadados do GitHub. A arquitetura detalhada não pôde ser avaliada pelo modelo de IA devido a: ${reason}.

## STACK
Linguagens principais detectadas: ${languageSummary}.
Tópicos do repositório: ${topics}.

## PONTOS_FORTES
- Metadados básicos do repositório disponíveis para análise
- README presente, facilitando onboarding de novos contribuidores
- Organização suficiente para análise inicial do projeto

## PONTOS_FRACOS
- Análise profunda limitada sem geração IA disponível
- Dependências e padrões internos podem exigir leitura manual de código
- Informações detalhadas de arquitetura não disponíveis no momento

## SUGESTOES_MELHORIA
- Adicionar seção de arquitetura detalhada no README
- Incluir guia de setup rápido e troubleshooting
- Padronizar scripts de desenvolvimento e testes
- Documentar decisões arquiteturais importantes (ADRs)

## TAREFAS_INICIANTES
- Melhorar documentação de instalação com exemplos práticos
- Criar issues de "good first issue" para novos contribuidores
- Cobrir partes críticas com testes básicos
- Adicionar badges de CI/CD e cobertura de testes ao README

> **Nota:** Análise gerada em modo fallback (${reason}).
`.trim();
        }

        return `
## RESUMO_ARQUITETURAL
Project "${repoData?.name || "repository"}" with typical structure inferred from GitHub metadata. Detailed architecture could not be evaluated by the AI model due to: ${reason}.

## STACK
Main detected languages: ${languageSummary}.
Repository topics: ${topics}.

## PONTOS_FORTES
- Basic repository metadata available for analysis
- README present, facilitating onboarding of new contributors
- Sufficient organization for initial project analysis

## PONTOS_FRACOS
- Deep analysis limited without available AI generation
- Dependencies and internal patterns may require manual code reading
- Detailed architecture information not available at this time

## SUGESTOES_MELHORIA
- Add detailed architecture section in README
- Include quick setup and troubleshooting guide
- Standardize development and testing scripts
- Document important architectural decisions (ADRs)

## TAREFAS_INICIANTES
- Improve installation documentation with practical examples
- Create "good first issue" issues for new contributors
- Cover critical parts with basic tests
- Add CI/CD badges and test coverage to README

> **Note:** Analysis generated in fallback mode (${reason}).
`.trim();
    }
}
