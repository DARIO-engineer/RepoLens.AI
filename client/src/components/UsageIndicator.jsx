import React from 'react';
import { useUsageTracker } from '../hooks/useUsageTracker';
import { useI18n } from '../useI18n';

export function UsageIndicator() {
  const { hasUserKey, remainingRequests, hasReachedLimit } = useUsageTracker();
  const { t } = useI18n();

  const baseClasses = "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-lg scale-105 sm:scale-100 hover:scale-105 active:scale-95";
  
  if (hasUserKey) {
    return (
      <div className={`${baseClasses} bg-gradient-to-br from-primary-light/85 to-accent/85 border border-white/20 text-white shadow-primary/30`}>
        <span className="text-base">🔑</span>
        <span>{t("apiKey.usage.userKey")}</span>
      </div>
    );
  }

  const statusClasses = hasReachedLimit 
    ? "bg-gradient-to-br from-danger/70 to-danger/90 border border-danger/40 text-white animate-pulse" 
    : "bg-gradient-to-br from-primary/85 to-accent/80 border border-white/20 text-white shadow-primary/30";

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <span className="text-base">{hasReachedLimit ? "❌" : "⚡"}</span>
      <span>
        {hasReachedLimit
          ? `0 ${t("apiKey.usage.remaining")}`
          : `${remainingRequests} ${t("apiKey.usage.remaining")}`}
      </span>
    </div>
  );
}
