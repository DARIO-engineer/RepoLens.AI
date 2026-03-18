import { useState } from "react";
import { useI18n } from "../useI18n";

export default function RepoForm({ onAnalyze, loading, disabled = false, disabledPlaceholder = "", disabledReason = "" }) {
  const [repoUrl, setRepoUrl] = useState("");
  const { t } = useI18n();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (repoUrl.trim()) onAnalyze(repoUrl.trim());
  };

  const isValidUrl = repoUrl.trim().startsWith("https://github.com/");
  const displayValue = disabled ? "" : repoUrl;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto animate-fade-in"
      style={{ animationDelay: '300ms' }}
      role="search"
      aria-label="Repository analysis"
    >
      <div className="relative group">
        {/* Outer glow on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/25 via-accent/15 to-primary/20 rounded-[2rem] opacity-0 group-focus-within:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row gap-3 p-2.5 rounded-[2rem] panel-metal glow-ring transition-all duration-300 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary-light/70" aria-hidden="true">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={disabled ? disabledPlaceholder : t("form.placeholder")}
              value={displayValue}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading || disabled}
              aria-label={disabled ? disabledPlaceholder : t("form.placeholder")}
              autoComplete="url"
              className="w-full pl-12 pr-5 py-4 rounded-[1.35rem] bg-black/10 text-text placeholder-text-muted/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all disabled:opacity-50 text-sm sm:text-[15px] font-semibold tracking-[0.01em]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || disabled || !repoUrl.trim()}
            className="px-8 py-4 rounded-[1.35rem] font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:shadow-xl active:scale-[0.97] cursor-pointer ring-1 ring-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-w-[180px]"
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
              {disabled ? t("form.unavailable") : t("form.button")}
            </span>
          )}
        </button>
        </div>
      </div>
      {disabled && disabledReason && (
        <p className="text-warning/80 text-xs mt-3 ml-3">
          {disabledReason}
        </p>
      )}
      {!disabled && repoUrl.trim() && !isValidUrl && (
        <p className="text-warning/80 text-xs mt-3 ml-3">
          {t("form.validation")}
        </p>
      )}
    </form>
  );
}
