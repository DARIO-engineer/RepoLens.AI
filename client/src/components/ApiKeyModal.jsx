import React, { useState } from 'react';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useI18n } from '../useI18n';

export function ApiKeyModal({ isOpen, onClose, onSuccess }) {
  const [keyInput, setKeyInput] = useState('');
  const { saveApiKey, isValidating, validationError } = useApiKeyManager();
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    const result = await saveApiKey(keyInput.trim());
    if (result.success) {
      onSuccess?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface border border-white/[0.08] rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 sm:p-10">
          <button 
            className="absolute top-6 right-6 text-text-muted hover:text-text transition-colors cursor-pointer" 
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <span className="text-3xl">🔑</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-text mb-2">{t("apiKey.modal.title")}</h2>
            <p className="text-text-muted text-sm">
              {t("apiKey.modal.subtitle")}
            </p>
          </div>

          <div className="bg-primary/[0.04] border border-primary/10 rounded-2xl p-4 mb-8">
            <p className="text-sm text-text-muted leading-relaxed">
              {t("apiKey.modal.info")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="api-key" className="block text-sm font-medium text-text-muted">
                {t("apiKey.modal.label")}
              </label>
              <input
                id="api-key"
                type="password"
                placeholder={t("apiKey.modal.placeholder")}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                disabled={isValidating}
                className={`w-full bg-black/20 border-2 rounded-xl px-4 py-3 text-text font-mono text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  validationError ? 'border-danger/50' : 'border-white/5 focus:border-primary/50'
                }`}
              />
              {validationError && (
                <p className="text-danger text-xs mt-1 animate-fade-in">{t("apiKey.modal.invalid")}</p>
              )}
            </div>

            <div className="flex items-center justify-center">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-light hover:text-primary transition-colors text-sm font-medium"
              >
                <span>📚 {t("apiKey.modal.help")}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-muted font-semibold hover:bg-white/[0.08] transition-all cursor-pointer"
                disabled={isValidating}
              >
                {t("apiKey.modal.cancel")}
              </button>
              <button 
                type="submit" 
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                disabled={isValidating || !keyInput.trim()}
              >
                {isValidating ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{t("apiKey.modal.validating")}</span>
                  </div>
                ) : t("apiKey.modal.save")}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[11px] text-text-muted/60 leading-relaxed">
              🔒 {t("apiKey.modal.security")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
