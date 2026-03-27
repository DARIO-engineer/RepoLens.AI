import React, { useState } from 'react';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import { useI18n } from '../useI18n';
import { toast } from 'react-toastify';

export function ApiKeyModal({ isOpen, onClose, onSuccess }) {
  const [keyInput, setKeyInput] = useState('');
  const { saveApiKey, provider: storedProvider, isValidating, validationError } = useApiKeyManager();
  const [provider, setProvider] = useState(storedProvider || 'gemini');
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    const result = await saveApiKey(keyInput.trim(), provider);
    if (result.success) {
      console.log('[api-key] modal save confirmed');
      toast.success(t("apiKey.modal.success", "✅ API Key validada e salva!"));
      onSuccess?.();
      onClose();
    } else {
      toast.error(validationError || t("apiKey.modal.error", "Erro ao validar a key."));
    }
  };

  if (!isOpen) return null;

  const helpUrl = provider === 'openrouter'
    ? 'https://openrouter.ai/settings/keys'
    : 'https://aistudio.google.com/app/apikey';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface border border-white/[0.08] rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-4 sm:p-8">
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-text-muted hover:text-text transition-colors cursor-pointer" 
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-primary/20">
              <svg className="w-8 h-8 text-primary-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-text mb-2">{t("apiKey.modal.title")}</h2>
            <p className="text-text-muted text-xs sm:text-sm">
              {t("apiKey.modal.subtitle")}
            </p>
          </div>

          <div className="bg-primary/[0.04] border border-primary/10 rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {t("apiKey.modal.info")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-muted">
                {t("apiKey.modal.providerLabel", "Provider")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('gemini')}
                  disabled={isValidating}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    provider === 'gemini'
                      ? 'bg-primary/12 border-primary/35 text-primary-light'
                      : 'bg-white/[0.02] border-white/[0.08] text-text-muted hover:text-text'
                  }`}
                >
                  {t("apiKey.modal.providerGemini", "Gemini")}
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('openrouter')}
                  disabled={isValidating}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    provider === 'openrouter'
                      ? 'bg-primary/12 border-primary/35 text-primary-light'
                      : 'bg-white/[0.02] border-white/[0.08] text-text-muted hover:text-text'
                  }`}
                >
                  {t("apiKey.modal.providerOpenRouter", "OpenRouter")}
                </button>
              </div>
            </div>

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
                href={helpUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-light hover:text-primary transition-colors text-sm font-medium"
              >
                <span>
                  📚 {provider === 'openrouter'
                    ? t("apiKey.modal.helpOpenRouter", "How to get an OpenRouter API key?")
                    : t("apiKey.modal.helpGemini", "How to get a Gemini API key?")}
                </span>
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
