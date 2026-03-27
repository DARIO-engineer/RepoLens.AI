import { useEffect, useState } from 'react';
import { ApiKeyStorage, StorageSync } from '../lib/apiKeyStorage';
import { validateGeminiKey } from '../lib/geminiClient';

export function useApiKeyManager() {
  const [apiKey, setApiKey] = useState(ApiKeyStorage.get() || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const syncApiKey = () => {
      setApiKey(ApiKeyStorage.get() || '');
    };

    window.addEventListener('storage', syncApiKey);
    window.addEventListener(StorageSync.EVENT_NAME, syncApiKey);

    return () => {
      window.removeEventListener('storage', syncApiKey);
      window.removeEventListener(StorageSync.EVENT_NAME, syncApiKey);
    };
  }, []);

  const saveApiKey = async (key) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const validationResult = await validateGeminiKey(key);
      
      if (validationResult.valid) {
        ApiKeyStorage.set(key);
        ApiKeyStorage.setValidated(true);
        setApiKey(key);
        return { success: true };
      }

      const message = validationResult.error || 'API Key inválida. Verifique e tente novamente.';
      setValidationError(message);
      return { success: false, error: message };
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
