import { useState } from "react";
import { useI18n } from "../i18n";
import LanguageRing from "./LanguageRing";
import HealthRadar from "./HealthRadar";

export default function RepoStats({ repoUrl, visible, repoData }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const { t } = useI18n();

  if (!visible) return null;

  if (!repoData) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto mb-8">
        <div className="rounded-2xl border border-white/10 bg-surface-card/80 p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-text-muted text-sm">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary-light rounded-full animate-spin" role="status" aria-label="Loading repository stats" />
            {t("stats.loading", "Loading stats...")}
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));

  const daysSinceUpdate = repoData.pushed_at
    ? Math.floor((Date.now() - new Date(repoData.pushed_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const lastUpdateLabel = daysSinceUpdate === 0 ? t("stats.today") :
    daysSinceUpdate === 1 ? t("stats.yesterday") :
    daysSinceUpdate !== null ? `${daysSinceUpdate}${t("stats.daysAgo")}` : "N/A";

  const stats = [
    {
      label: "Stars",
      value: fmt(repoData.stargazers_count || 0),
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      color: "text-warning",
    },
    {
      label: "Forks",
      value: fmt(repoData.forks_count || 0),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: "text-accent",
    },
    {
      label: "Issues",
      value: fmt(repoData.open_issues_count || 0),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-accent-green",
    },
    {
      label: "Watchers",
      value: fmt(repoData.subscribers_count || repoData.watchers_count || 0),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: "text-primary-light",
    },
    {
      label: t("stats.lastPush"),
      value: lastUpdateLabel,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-text-muted",
    },
    {
      label: t("stats.license"),
      value: repoData.license?.spdx_id || "N/A",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "text-text-muted",
    },
  ];

  return (
    <div className="animate-fade-in max-w-3xl mx-auto mb-8">
      <div className="rounded-2xl border border-white/10 bg-surface-card/80 overflow-hidden">
        {/* Repo Header */}
        <div className="p-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img
              src={repoData.owner?.avatar_url}
              alt=""
              className="w-10 h-10 rounded-xl ring-2 ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <a
                href={repoData.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-text hover:text-primary-light transition-colors truncate block"
              >
                {repoData.full_name}
              </a>
              {repoData.description && (
                <div className="mt-0.5">
                  <p className={`text-xs text-text-muted transition-all duration-300 ${descExpanded ? "" : "line-clamp-1"}`}>
                    {repoData.description}
                  </p>
                  {repoData.description.length > 80 && (
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="text-[10px] text-primary-light/70 hover:text-primary-light mt-0.5 cursor-pointer transition-colors"
                    >
                      {descExpanded ? t("stats.showLess") : t("stats.showMore")}
                    </button>
                  )}
                </div>
              )}
            </div>
            <a
              href={repoData.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-light border border-white/10 text-text-muted hover:text-text hover:border-white/20 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {t("stats.open")}
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-white/5">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center py-3.5 px-2 ${i > 0 ? "border-l border-white/5" : ""} hover:bg-white/[0.02] transition-colors`}
            >
              <span className={`${stat.color} opacity-60 mb-1`}>{stat.icon}</span>
              <p className="text-sm font-bold text-text leading-none">{stat.value}</p>
              <p className="text-[9px] text-text-muted uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Visuals: Language Ring + Health Radar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* Language DNA */}
          <div className="p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-white/5">
            <h4 className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-4">
              {t("stats.langDNA")}
            </h4>
            <LanguageRing repoUrl={repoData.html_url} />
          </div>

          {/* Health Radar */}
          <div className="p-6 flex flex-col items-center justify-center">
            <h4 className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-4">
              {t("stats.healthRadar")}
            </h4>
            <HealthRadar repoData={repoData} />
          </div>
        </div>

        {/* Topics */}
        {repoData.topics?.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5 flex flex-wrap gap-1.5">
            {repoData.topics.slice(0, 10).map((topic) => (
              <span
                key={topic}
                className="px-2.5 py-0.5 text-[10px] rounded-full bg-primary/8 text-primary-light border border-primary/15 hover:border-primary/30 transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
