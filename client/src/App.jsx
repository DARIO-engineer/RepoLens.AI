import { useState, useEffect, useRef } from 'react'
import RepoForm from "./components/RepoForm";
import RepoStats from "./components/RepoStats";
import AnalysisResult from "./components/AnalysisResult";
import HeroOrb from "./components/HeroOrb";
import ArchitectureGraph from "./components/ArchitectureGraph";
import RepoPersonality from "./components/RepoPersonality";
import CopilotBanner from "./components/CopilotBanner";
import { useI18n } from "./i18n";
import axios from "axios";

const HISTORY_KEY = "repolens-history";
const MAX_HISTORY = 10;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch { return []; }
}

function saveToHistory(entry) {
  const history = loadHistory().filter((h) => h.url !== entry.url);
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function App() {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentRepoUrl, setCurrentRepoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [history, setHistory] = useState(loadHistory);
  const [analysisLang, setAnalysisLang] = useState("");
  const resultsRef = useRef(null);
  const { t, lang, toggleLang } = useI18n();

  const langMismatch = analysis && analysisLang && lang !== analysisLang;

  const repoName = currentRepoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || "";

  const handleAnalyze = async (repoUrl) => {
    setLoading(true);
    setAnalysis("");
    setError("");
    setCurrentRepoUrl(repoUrl);
    setDuration(0);

    const start = Date.now();

    try {
      const res = await axios.post("/api/analyze", { repoUrl, lang });
      const elapsed = Date.now() - start;
      setDuration(elapsed);
      setAnalysis(res.data.analysis);
      setAnalysisLang(lang);

      // Save to history
      const name = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/)?.[1] || repoUrl;
      saveToHistory({ url: repoUrl, name, date: new Date().toISOString() });
      setHistory(loadHistory());

      // Scroll to results after a brief delay
      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      setDuration(Date.now() - start);
      const backendError = err.response?.data;
      let message = backendError?.error || err.message || "Error analyzing repository.";
      if (typeof message === "object") message = JSON.stringify(message);
      let details = backendError?.details || "";
      if (typeof details === "object") details = JSON.stringify(details);
      const hint = backendError?.hint ? `\n${backendError.hint}` : "";
      setError(`${message}${details ? "\n" + details : ""}${hint}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (url) => {
    handleAnalyze(url);
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-light/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
            RL
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">
              RepoLens AI
            </h1>
            <p className="text-xs text-text-muted hidden sm:block">
              {t("header.subtitle")}
            </p>
          </div>
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="ml-auto flex items-center justify-center w-9 h-9 rounded-lg bg-surface-light/80 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            title={lang === "en" ? "Mudar para Português" : "Switch to English"}
          >
            <span className="text-lg">{lang === "en" ? "🇺🇸" : "🇧🇷"}</span>
          </button>
          {/* LinkedIn — visible after 2026-02-16 15:10 BRT */}
          {Date.now() >= new Date("2026-02-16T15:10:00-03:00").getTime() && (
          <a
            href="https://www.linkedin.com/in/d%C3%A1rio-pimentel-5a03462ba"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-[#0A66C2] transition-colors"
            title="LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          )}
          <a
            href="https://github.com/DARIO-engineer/RepoLens.AI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-text transition-colors"
            title="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        <section className="py-12 sm:py-16 text-center relative">          <HeroOrb />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
            {t("header.badge")}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-text leading-tight mb-4">
            {t("hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto mb-10 text-sm sm:text-base">
            {t("hero.desc")}
          </p>

          <RepoForm onAnalyze={handleAnalyze} loading={loading} />

          {/* Recent History */}
          {history.length > 0 && !loading && !analysis && (
            <div className="animate-fade-in mt-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{t("history.title")}</span>
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-text-muted/60 hover:text-danger transition-colors cursor-pointer"
                >
                  {t("history.clear")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 6).map((item) => (
                  <button
                    key={item.url}
                    onClick={() => handleHistoryClick(item.url)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-light/60 border border-white/5 text-xs text-text-muted hover:text-text hover:border-primary/30 hover:bg-surface-light transition-all cursor-pointer group"
                  >
                    <svg className="w-3.5 h-3.5 text-text-muted/50 group-hover:text-primary-light transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="animate-fade-in max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-semibold mb-1">{t("error.title")}</p>
                <p className="whitespace-pre-wrap opacity-80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Repo Stats */}
        <RepoStats repoUrl={currentRepoUrl} visible={!!(analysis || loading)} />

        {/* Architecture Graph */}
        <ArchitectureGraph repoUrl={currentRepoUrl} visible={!!(analysis || loading)} />

        {/* Repo Personality */}
        <RepoPersonality repoUrl={currentRepoUrl} visible={!!analysis} />

        {/* Language mismatch banner */}
        {langMismatch && (
          <div className="max-w-3xl md:max-w-4xl mx-auto mb-4 animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/20 text-sm">
              <svg className="w-4.5 h-4.5 text-warning shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-text-muted text-xs flex-1">
                {t("analysis.langMismatch")}
              </span>
              <button
                onClick={() => handleAnalyze(currentRepoUrl)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 border border-primary/25 text-primary-light hover:bg-primary/25 transition-all cursor-pointer"
              >
                {t("analysis.reAnalyze")}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <AnalysisResult analysis={analysis} loading={loading} duration={duration} repoName={repoName} />

        {/* Copilot CLI Showcase — temporary until 2026-02-16 15:00 BRT */}
        {analysis && Date.now() < new Date("2026-02-16T15:00:00-03:00").getTime() && <CopilotBanner />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8 text-center text-text-muted text-xs space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-[8px]">RL</div>
          <span className="font-medium text-text/80">RepoLens AI</span>
        </div>
        <p>{t("footer.builtWith")} &bull; {t("footer.challenge")}</p>
        <div className="flex items-center justify-center gap-3 text-text-muted/50">
          <span>{t("footer.author")}</span>
          {/* LinkedIn — visible after 2026-02-16 15:10 BRT */}
          {Date.now() >= new Date("2026-02-16T15:10:00-03:00").getTime() && (
          <a href="https://www.linkedin.com/in/d%C3%A1rio-pimentel-5a03462ba" target="_blank" rel="noopener noreferrer" className="hover:text-[#0A66C2] transition-colors" title="LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          )}
          <a href="https://github.com/DARIO-engineer" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors" title="GitHub">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App
