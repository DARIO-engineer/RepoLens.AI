import { useEffect, useState } from 'react';
import { ApiKeyStorage, StorageSync } from '../lib/apiKeyStorage';
import { validateApiKey } from '../lib/geminiClient';

export function useApiKeyManager() {
  const [apiKey, setApiKey] = useState(ApiKeyStorage.get() || '');
  const [provider, setProvider] = useState(ApiKeyStorage.getProvider());
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const syncApiKey = () => {
      setApiKey(ApiKeyStorage.get() || '');
      setProvider(ApiKeyStorage.getProvider());
    };

    window.addEventListener('storage', syncApiKey);
    window.addEventListener(StorageSync.EVENT_NAME, syncApiKey);

    return () => {
      window.removeEventListener('storage', syncApiKey);
      window.removeEventListener(StorageSync.EVENT_NAME, syncApiKey);
    };
  }, []);

  const saveApiKey = async (key, selectedProvider = 'gemini') => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const validationResult = await validateApiKey(key, selectedProvider);
      
      if (validationResult.valid) {
        try {
          ApiKeyStorage.set(key);
          ApiKeyStorage.setProvider(selectedProvider);
          ApiKeyStorage.setValidated(true);
          setApiKey(key);
          setProvider(selectedProvider);
          console.log('[api-key] saved successfully', { provider: selectedProvider });
          return { success: true };
        } catch (storageError) {
          console.log('[api-key] storage save failed', storageError);
          setValidationError('Erro ao salvar a chave no navegador.');
          return { success: false, error: 'Storage error' };
        }
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
    provider,
    saveApiKey,
    removeApiKey,
    hasApiKey: hasApiKey(),
    isValidating,
    validationError,
  };
}
