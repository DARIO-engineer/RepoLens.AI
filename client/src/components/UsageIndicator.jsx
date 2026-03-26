import React from 'react';
import { useUsageTracker } from '../hooks/useUsageTracker';

export function UsageIndicator() {
  const { hasUserKey, remainingRequests, hasReachedLimit } = useUsageTracker();

  const baseClasses = "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-lg";
  
  if (hasUserKey) {
    return (
      <div className={`${baseClasses} bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary-light`}>
        <span className="text-sm">🔑</span>
        <span>Personal API Key</span>
      </div>
    );
  }

  const statusClasses = hasReachedLimit 
    ? "bg-gradient-to-r from-danger/20 to-danger/40 border border-danger/30 text-danger animate-pulse" 
    : "bg-white/[0.04] border border-white/[0.08] text-text-muted hover:border-primary/30";

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <span className="text-sm">⚡</span>
      <span>
        {hasReachedLimit 
          ? 'Limit reached - Add your key' 
          : `${remainingRequests} free remaining`
        }
      </span>
    </div>
  );
}
