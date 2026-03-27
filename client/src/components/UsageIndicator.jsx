import React from 'react';
import { useUsageTracker } from '../hooks/useUsageTracker';
import { useI18n } from '../useI18n';

export function UsageIndicator() {
  const { hasUserKey, remainingRequests, hasReachedLimit } = useUsageTracker();
  const { t } = useI18n();

  const baseClasses = "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-lg scale-105 sm:scale-100 hover:scale-105 active:scale-95";
  
  if (hasUserKey) {
    return (
      <div className={`${baseClasses} bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary-light`}>
        <span className="text-sm">🔑</span>
        <span>{t("apiKey.usage.userKey")}</span>
      </div>
    );
  }

  const statusClasses = hasReachedLimit 
    ? "bg-gradient-to-r from-danger/20 to-danger/40 border border-danger/30 text-danger animate-pulse" 
    : "bg-white/[0.04] border border-white/[0.08] text-text-muted hover:border-primary/30";

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <span className="text-sm">{hasReachedLimit ? "❌" : "⚡"}</span>
      <span>
        {hasReachedLimit
          ? `0 ${t("apiKey.usage.remaining")}`
          : `${remainingRequests} ${t("apiKey.usage.remaining")}`}
      </span>
    </div>
  );
}
