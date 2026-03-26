import React from 'react';
import { useUsageTracker } from '../hooks/useUsageTracker';
import { useI18n } from '../useI18n';

export function UsageIndicator() {
  const { hasUserKey, remainingRequests, hasReachedLimit } = useUsageTracker();
  const { t } = useI18n();

  const baseClasses = "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-lg";
  
  if (hasUserKey) {
    return (
      <div className={`${baseClasses} bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary-light`}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>{t("apiKey.usage.userKey")}</span>
      </div>
    );
  }

  const statusClasses = hasReachedLimit 
    ? "bg-gradient-to-r from-danger/20 to-danger/40 border border-danger/30 text-danger animate-pulse" 
    : "bg-white/[0.04] border border-white/[0.08] text-text-muted hover:border-primary/30";

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <span>
        {hasReachedLimit 
          ? t("apiKey.usage.limitReached")
          : `${remainingRequests} ${t("apiKey.usage.remaining")}`
        }
      </span>
    </div>
  );
}
