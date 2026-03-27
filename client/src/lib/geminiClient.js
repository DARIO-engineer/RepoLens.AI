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

function buildAnalysisPrompt(repoUrl, lang) {
  return `Analyze this GitHub repository: ${repoUrl}. Language: ${lang}. 
Please provide a detailed analysis in ${lang === 'pt' ? 'Portuguese' : 'English'}.
The response must follow a specific structure with sections like ARCHITECTURAL_SUMMARY, STACK_ANALYSIS, STRENGTHS, WEAKNESSES, SUGGESTIONS, and BEGINNER_TASKS.`;
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
        return { analysis: parsed.analysis, isUserKey: parsed.isUserKey, fromCache: true };
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

    const prompt = buildAnalysisPrompt(repoUrl, lang);
    
    try {
      if (userProvider === 'openrouter') {
        const response = await fetch(API_CONFIG.OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userKey}`,
          },
          body: JSON.stringify({
            model: API_CONFIG.OPENROUTER_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(
            error?.error?.message ||
              error?.message ||
              'OpenRouter request failed'
          );
        }

        const data = await response.json();
        const content = getOpenRouterTextContent(data?.choices?.[0]?.message?.content);

        if (!content) {
          throw new Error('OpenRouter returned an empty response.');
        }

        result = {
          analysis: content,
          isUserKey: true,
        };
      } else {
        const response = await fetch(
          `${API_CONFIG.GEMINI_API_URL}?key=${userKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        result = {
          analysis: data.candidates[0].content.parts[0].text,
          isUserKey: true
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
