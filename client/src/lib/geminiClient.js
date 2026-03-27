import axios from 'axios';
import { ApiKeyStorage } from './apiKeyStorage';
import { API_CONFIG } from '../constants/config';

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
      `${API_CONFIG.GEMINI_API_URL}?key=${trimmedKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'API Key Validation Test. Reply with "OK".' }]
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

/**
 * Faz request ao Gemini ou ao Backend dependendo da disponibilidade de key do usuário
 */
export async function analyzeRepository(repoUrl, lang, options = {}) {
  const { forceRefresh = false } = options;
  const cacheKey = `repolens_cache_${btoa(repoUrl + "_" + lang)}`;
  const cached = forceRefresh ? null : localStorage.getItem(cacheKey);
  let result;
  
  // Cache check (expires if different or manually cleared, but here we just return)
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Optional: check if cache is too old (e.g., > 1 hour)
      if (Date.now() - parsed.timestamp < 3600000) {
        return { analysis: parsed.analysis, isUserKey: parsed.isUserKey, fromCache: true };
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  const userKey = ApiKeyStorage.get();
  
  if (userKey) {
    // Rate limiting for personal key (1 request per minute)
    const LAST_REQ_KEY = 'repolens_last_user_request';
    const lastReq = localStorage.getItem(LAST_REQ_KEY);
    const now = Date.now();
    if (lastReq && now - parseInt(lastReq) < 60000) {
      const waitTime = Math.ceil((60000 - (now - parseInt(lastReq))) / 1000);
      throw new Error(`Rate limit: Please wait ${waitTime}s before another analysis.`);
    }
    localStorage.setItem(LAST_REQ_KEY, now.toString());

    // ... logic for userKey ...
    const prompt = `Analyze this GitHub repository: ${repoUrl}. Language: ${lang}. 
    Please provide a detailed analysis in ${lang === 'pt' ? 'Portuguese' : 'English'}.
    The response must follow a specific structure with sections like ARCHITECTURAL_SUMMARY, STACK_ANALYSIS, STRENGTHS, WEAKNESSES, SUGGESTIONS, and BEGINNER_TASKS.`;
    
    try {
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
    } catch (error) {
      console.error('Gemini API error:', error);
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
  localStorage.setItem(cacheKey, JSON.stringify({
    analysis: result.analysis,
    isUserKey: result.isUserKey,
    timestamp: Date.now()
  }));

  return result;
}
