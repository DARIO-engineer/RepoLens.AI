import { useState } from 'react';
import { ApiKeyStorage } from '../lib/apiKeyStorage';
import { validateGeminiKey } from '../lib/geminiClient';

export function useApiKeyManager() {
  const [apiKey, setApiKey] = useState(ApiKeyStorage.get() || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const saveApiKey = async (key) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // Valida a key com uma request de teste
      const isValid = await validateGeminiKey(key);
      
      if (isValid) {
        ApiKeyStorage.set(key);
        ApiKeyStorage.setValidated(true);
        setApiKey(key);
        return { success: true };
      } else {
        setValidationError('API Key inválida. Verifique e tente novamente.');
        return { success: false, error: 'Invalid key' };
      }
    } catch (error) {
      setValidationError('Erro ao validar a key. Tente novamente.');
      return { success: false, error: error.message };
    } finally {
      setIsValidating(false);
    }
  };

  const removeApiKey = () => {
    ApiKeyStorage.remove();
    setApiKey('');
    setValidationError(null);
  };

  const hasApiKey = () => {
    return ApiKeyStorage.exists();
  };

  return {
    apiKey,
    saveApiKey,
    removeApiKey,
    hasApiKey: hasApiKey(),
    isValidating,
    validationError,
  };
}
