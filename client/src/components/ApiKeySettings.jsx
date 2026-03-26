import React from 'react';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useI18n } from '../useI18n';

export function ApiKeySettings() {
  const { hasApiKey, removeApiKey } = useApiKeyManager();
  const { t } = useI18n();

  if (!hasApiKey) return null;

  const handleRemove = () => {
    if (confirm(t("apiKey.settings.confirm"))) {
      removeApiKey();
    }
  };

  return (
    <div className="max-w-4xl lg:max-w-5xl mx-auto mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-primary/[0.04] border border-primary/10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
            <svg className="w-6 h-6 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{t("apiKey.settings.title")}</h3>
            <p className="text-xs text-text-muted mt-0.5">{t("apiKey.settings.desc")}</p>
          </div>
        </div>
        <button 
          onClick={handleRemove} 
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold hover:bg-danger/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          {t("apiKey.settings.remove")}
        </button>
      </div>
    </div>
  );
}
