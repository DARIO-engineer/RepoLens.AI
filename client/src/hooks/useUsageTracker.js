import { useState, useEffect } from 'react';
import { UsageStorage, ApiKeyStorage } from '../lib/apiKeyStorage';
import { API_CONFIG } from '../constants/config';

export function useUsageTracker() {
  const [usage, setUsage] = useState(UsageStorage.get());
  const [hasUserKey, setHasUserKey] = useState(ApiKeyStorage.exists());

  useEffect(() => {
    // Verifica se precisa resetar ao carregar
    UsageStorage.checkAndReset();
    setUsage(UsageStorage.get());
  }, []);

  const incrementUsage = () => {
    const newCount = UsageStorage.increment();
    setUsage(UsageStorage.get());
    return newCount;
  };

  const resetUsage = () => {
    UsageStorage.reset();
    setUsage(UsageStorage.get());
  };

  const hasReachedLimit = () => {
    return usage.count >= API_CONFIG.MAX_FREE_REQUESTS;
  };

  const getRemainingRequests = () => {
    return Math.max(0, API_CONFIG.MAX_FREE_REQUESTS - usage.count);
  };

  const canMakeRequest = () => {
    return hasUserKey || !hasReachedLimit();
  };

  return {
    usage,
    hasReachedLimit: hasReachedLimit(),
    remainingRequests: getRemainingRequests(),
    canMakeRequest: canMakeRequest(),
    incrementUsage,
    resetUsage,
    hasUserKey,
    setHasUserKey,
  };
}
