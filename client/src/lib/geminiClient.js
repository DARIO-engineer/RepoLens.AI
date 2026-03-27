import axios from 'axios';
import { ApiKeyStorage } from './apiKeyStorage';
import { API_CONFIG } from '../constants/config';

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures
  }
}

function parseRepoFromUrl(repoUrl) {
  const match = String(repoUrl || '').match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ''),
  };
}

async function fetchRepositoryContext(repoUrl) {
  const parsed = parseRepoFromUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL.');
  }

  const { owner, repo } = parsed;
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const [repoRes, languagesRes, readmeRes, treeRes] = await Promise.all([
    fetch(base),
    fetch(`${base}/languages`),
    fetch(`${base}/readme`, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
    }).catch(() => null),
    fetch(`${base}/git/trees/HEAD?recursive=1`).catch(() => null),
  ]);

  if (!repoRes.ok) {
    throw new Error('Repository metadata is unavailable.');
  }

  const repoData = await repoRes.json();
  const languages = languagesRes.ok ? await languagesRes.json() : {};
  const readme = readmeRes?.ok ? await readmeRes.text() : '';
  const treeJson = treeRes?.ok ? await treeRes.json() : null;

  const tree = (treeJson?.tree || [])
    .slice(0, 120)
    .map((item) => `${item.type === 'tree' ? 'DIR' : 'FILE'} ${item.path}`)
    .join('\n');

  return {
    repoData,
    languages,
    readme: String(readme || '').slice(0, 5000),
    tree,
  };
}

function buildAnalysisPrompt(repoUrl, lang, context) {
  const isPt = lang === 'pt';
  const { repoData, languages, readme, tree } = context;
  const languageBreakdown = Object.entries(languages || {})
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 8)
    .map(([name, bytes]) => `${name}: ${bytes}`)
    .join(', ');

  const criticalRules = isPt
    ? `REGRAS CRÍTICAS:
- Se você NÃO conseguir acessar o código do repo, responda apenas: 'ERRO: Repositório inacessível'
- NUNCA invente stack, arquitetura ou sugestões para código que você não viu
- Se repo vazio, responda: 'ERRO: Repositório vazio'
- Só analise se conseguir VER o código real`
    : `CRITICAL RULES:
- If you cannot access repository code, reply only: 'ERROR: Repository inaccessible'
- NEVER invent stack, architecture, or suggestions for code you did not inspect
- If repository is empty, reply only: 'ERROR: Empty repository'
- Only analyze if you can see real repository code context`;

  const languageInstruction = isPt
    ? 'Responda em português brasileiro.'
    : 'Respond entirely in American English.';

  return `${criticalRules}

Repository URL: ${repoUrl}
Name: ${repoData?.full_name || `${repoData?.owner?.login || ''}/${repoData?.name || ''}`}
Description: ${repoData?.description || 'N/A'}
Stars: ${repoData?.stargazers_count || 0}
Forks: ${repoData?.forks_count || 0}
Main language: ${repoData?.language || 'N/A'}
Languages (bytes): ${languageBreakdown || 'N/A'}
Last update: ${repoData?.updated_at || 'N/A'}

README:
${readme || 'N/A'}

Repository tree sample:
${tree || 'N/A'}

Now provide a deep technical analysis with strong evidence from the repository context.
Do not be generic. Do not write vague advice.
Each point must be concrete and tied to repo metadata, files, or stack signals.

MANDATORY FORMAT (exact section keys):
## RESUMO_ARQUITETURAL
## STACK
## PONTOS_FORTES
## PONTOS_FRACOS
## SUGESTOES_MELHORIA
## TAREFAS_INICIANTES

QUALITY BAR:
- RESUMO_ARQUITETURAL: 2-3 dense paragraphs with architecture flow and responsibilities
- STACK: explicit technologies by layer (frontend/backend/data/devops/tooling)
- PONTOS_FORTES: at least 5 concrete strengths with technical rationale
- PONTOS_FRACOS: at least 5 concrete weaknesses with impact
- SUGESTOES_MELHORIA: at least 6 prioritized improvements (quick wins + strategic)
- TAREFAS_INICIANTES: at least 6 actionable beginner tasks
- Never invent dependencies or files not implied by context

${languageInstruction}`;
}

const REQUIRED_SECTIONS = [
  '## RESUMO_ARQUITETURAL',
  '## STACK',
  '## PONTOS_FORTES',
  '## PONTOS_FRACOS',
  '## SUGESTOES_MELHORIA',
  '## TAREFAS_INICIANTES',
];

function isHighQualityAnalysis(text) {
  if (!text || typeof text !== 'string') return false;
  const hasAllSections = REQUIRED_SECTIONS.every((section) => text.includes(section));
  if (!hasAllSections) return false;

  const bulletCount = (text.match(/^\s*[-*•]\s+/gm) || []).length;
  return bulletCount >= 18;
}

function buildCacheKey(repoUrl, lang) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
  const owner = match?.[1] || 'unknown';
  const repo = (match?.[2] || 'unknown').replace(/\.git$/i, '');
  return `cache_${owner}_${repo}_${lang}`;
}

/**
 * Valida se uma API key do Gemini funciona
 */
export async function validateGeminiKey(apiKey) {
  const trimmedKey = apiKey?.trim();
  if (!trimmedKey) {
    return { valid: false, error: 'API Key vazia.' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${trimmedKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'test' }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const status = response.status;
      const providerMessage = error?.error?.message;
      console.error('Gemini Key Validation failed:', error);

      if (status === 400 || status === 401 || status === 403) {
        return {
          valid: false,
          error: providerMessage || 'API Key inválida. Verifique e tente novamente.',
        };
      }

      return {
        valid: false,
        error: providerMessage || 'Não foi possível validar a API Key agora.',
      };
    }

    const data = await response.json();
    return {
      valid: !!data.candidates?.[0]?.content?.parts?.[0]?.text,
      error: null,
    };
  } catch (error) {
    console.error('Key validation error:', error);
    return {
      valid: false,
      error: 'Erro de rede ao validar a API Key.',
    };
  }
}

export async function validateOpenRouterKey(apiKey) {
  const trimmedKey = apiKey?.trim();
  if (!trimmedKey) {
    return { valid: false, error: 'API Key vazia.' };
  }

  try {
    const response = await fetch(API_CONFIG.OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENROUTER_MODEL,
        messages: [{ role: 'user', content: 'Reply with OK' }],
        max_tokens: 16,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const providerMessage = error?.error?.message || error?.message;
      return {
        valid: false,
        error: providerMessage || 'OpenRouter key inválida ou sem créditos/quota.',
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const isValid = Array.isArray(content) ? content.length > 0 : Boolean(content);

    return { valid: isValid, error: null };
  } catch (error) {
    console.error('OpenRouter validation error:', error);
    return { valid: false, error: 'Erro de rede ao validar a API Key.' };
  }
}

export async function validateApiKey(apiKey, provider = 'gemini') {
  if (provider === 'openrouter') {
    return validateOpenRouterKey(apiKey);
  }
  return validateGeminiKey(apiKey);
}

function getOpenRouterTextContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('\n')
      .trim();
  }
  return '';
}

async function requestOpenRouterAnalysis({ apiKey, prompt, lang }) {
  const response = await fetch(API_CONFIG.OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: lang === 'pt'
            ? 'Você é um arquiteto de software sênior. Entregue análise profunda e concreta. Nunca responda de forma genérica.'
            : 'You are a senior software architect. Deliver deep, concrete analysis. Never respond with generic advice.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.35,
      top_p: 0.9,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || error?.message || 'OpenRouter request failed');
  }

  const data = await response.json();
  const content = getOpenRouterTextContent(data?.choices?.[0]?.message?.content);
  if (!content) throw new Error('OpenRouter returned an empty response.');
  return content;
}

async function requestGeminiAnalysis({ apiKey, prompt }) {
  const response = await fetch(
    `${API_CONFIG.GEMINI_API_URL}?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          temperature: 0.35,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Faz request ao Gemini ou ao Backend dependendo da disponibilidade de key do usuário
 */
export async function analyzeRepository(repoUrl, lang, options = {}) {
  const { forceRefresh = false } = options;
  const cacheKey = buildCacheKey(repoUrl, lang);
  const cached = forceRefresh ? null : safeStorageGet(cacheKey);
  let result;
  
  // Cache check (expires if different or manually cleared, but here we just return)
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Cache TTL: 24h
      if (Date.now() - parsed.timestamp < 86400000) {
        const cachedHours = (Date.now() - parsed.timestamp) / 3600000;
        return {
          analysis: parsed.analysis,
          isUserKey: parsed.isUserKey,
          fromCache: true,
          cachedHours,
        };
      }
    } catch {
      safeStorageRemove(cacheKey);
    }
  }

  const userKey = ApiKeyStorage.get();
  const userProvider = ApiKeyStorage.getProvider();
  
  if (userKey) {
    // Rate limiting for personal key (1 request per minute)
    const LAST_REQ_KEY = 'repolens_last_user_request';
    const lastReq = safeStorageGet(LAST_REQ_KEY);
    const now = Date.now();
    if (lastReq && now - parseInt(lastReq) < 60000) {
      const waitTime = Math.ceil((60000 - (now - parseInt(lastReq))) / 1000);
      throw new Error(`Rate limit: Please wait ${waitTime}s before another analysis.`);
    }
    safeStorageSet(LAST_REQ_KEY, now.toString());

    const repoContext = await fetchRepositoryContext(repoUrl);
    const prompt = buildAnalysisPrompt(repoUrl, lang, repoContext);
    
    try {
      if (userProvider === 'openrouter') {
        let content = await requestOpenRouterAnalysis({ apiKey: userKey, prompt, lang });
        if (!isHighQualityAnalysis(content)) {
          const repairPrompt = `${prompt}\n\nThe previous answer was incomplete or generic. Rewrite from scratch with full depth, all sections, and concrete evidence.`;
          content = await requestOpenRouterAnalysis({ apiKey: userKey, prompt: repairPrompt, lang });
        }

        result = {
          analysis: content,
          isUserKey: true,
        };
      } else {
        let content = await requestGeminiAnalysis({ apiKey: userKey, prompt });
        if (!isHighQualityAnalysis(content)) {
          const repairPrompt = `${prompt}\n\nThe previous answer was incomplete or generic. Rewrite from scratch with full depth, all sections, and concrete evidence.`;
          content = await requestGeminiAnalysis({ apiKey: userKey, prompt: repairPrompt });
        }

        result = {
          analysis: content,
          isUserKey: true,
        };
      }
    } catch (error) {
      console.error('AI provider API error:', error);
      throw error;
    }
  } else {
    // Se não tem key do usuário, usa o backend (que usa a key do sistema)
    const res = await axios.post("/api/analyze", { repoUrl, lang });
    result = {
      analysis: res.data.analysis,
      isUserKey: false
    };
  }

  // Save to cache
  safeStorageSet(cacheKey, JSON.stringify({
    analysis: result.analysis,
    isUserKey: result.isUserKey,
    timestamp: Date.now()
  }));

  return result;
}
