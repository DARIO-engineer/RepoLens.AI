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
      className="max-w-2xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t("form.placeholder")}
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={loading}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-light border border-white/10 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !repoUrl.trim()}
          className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("form.loading")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("form.button")}
            </span>
          )}
        </button>
      </div>
      {repoUrl.trim() && !isValidUrl && (
        <p className="text-warning/80 text-xs mt-2 ml-1">
          {t("form.validation")}
        </p>
      )}
    </form>
  );
}
