import { useState } from "react";
import { useI18n } from "../i18n";

export default function RepoForm({ onAnalyze, loading }) {
  const [repoUrl, setRepoUrl] = useState("");
  const { t } = useI18n();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl.trim()) onAnalyze(repoUrl.trim());
  };

  const isValidUrl = repoUrl.trim().startsWith("https://github.com/");

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto animate-fade-in"
      style={{ animationDelay: '300ms' }}
      role="search"
      aria-label="Repository analysis"
    >
      <div className="relative group">
        {/* Outer glow on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-surface-light/80 border border-white/[0.08] backdrop-blur-sm glow-ring transition-all duration-300">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted/50" aria-hidden="true">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t("form.placeholder")}
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading}
              aria-label={t("form.placeholder")}
              autoComplete="url"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-transparent text-text placeholder-text-muted/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all disabled:opacity-50 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !repoUrl.trim()}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:shadow-xl active:scale-[0.97] cursor-pointer ring-1 ring-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("form.loading")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("form.button")}
            </span>
          )}
        </button>
        </div>
      </div>
      {repoUrl.trim() && !isValidUrl && (
        <p className="text-warning/80 text-xs mt-3 ml-3">
          {t("form.validation")}
        </p>
      )}
    </form>
  );
}
