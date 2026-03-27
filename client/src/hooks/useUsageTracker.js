import { useState, useEffect } from 'react';
import { UsageStorage, ApiKeyStorage, StorageSync } from '../lib/apiKeyStorage';
import { API_CONFIG } from '../constants/config';

export function useUsageTracker() {
  const [usage, setUsage] = useState(() => UsageStorage.get());
  const [hasUserKey, setHasUserKey] = useState(() => ApiKeyStorage.exists());

  useEffect(() => {
    const syncState = () => {
      UsageStorage.checkAndReset();
      setUsage(UsageStorage.get());
      setHasUserKey(ApiKeyStorage.exists());
    };

    syncState();

    window.addEventListener('storage', syncState);
    window.addEventListener(StorageSync.EVENT_NAME, syncState);
    const intervalId = window.setInterval(syncState, 30000);

    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener(StorageSync.EVENT_NAME, syncState);
      window.clearInterval(intervalId);
    };
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
