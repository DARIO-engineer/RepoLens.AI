import axios from 'axios';
import { ApiKeyStorage } from './apiKeyStorage';
import { API_CONFIG } from '../constants/config';

/**
 * Valida se uma API key do Gemini funciona
 */
export async function validateGeminiKey(apiKey) {
  try {
    const response = await fetch(
      `${API_CONFIG.GEMINI_API_URL}?key=${apiKey}`,
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

    return response.ok;
  } catch (error) {
    console.error('Key validation error:', error);
    return false;
  }
}

/**
 * Faz request ao Gemini ou ao Backend dependendo da disponibilidade de key do usuário
 */
export async function analyzeRepository(repoUrl, lang) {
  const userKey = ApiKeyStorage.get();

  if (userKey) {
    // Se tem key do usuário, faz a análise diretamente no frontend para economizar custos/limites do servidor
    // Precisamos de um prompt similar ao que o backend usa
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
      return {
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
    return {
      analysis: res.data.analysis,
      isUserKey: false
    };
  }
}
