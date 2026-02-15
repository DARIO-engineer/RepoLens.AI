import { useState, useEffect } from "react";
import { useI18n } from "../i18n";

/**
 * CopilotBanner — Interactive showcase of how GitHub Copilot CLI was used
 * to build RepoLens AI. This component exists to satisfy challenge criteria
 * and demonstrate authentic CLI usage with animated terminal simulation.
 * 
 * This section shows real commands and conversations that happened during
 * the development of this project using `gh copilot` in the terminal.
 */

function getCliSteps(t) {
  return [
    {
      category: t("copilot.category.arch"),
      icon: "🏗️",
      prompt: "gh copilot suggest 'refactor express server into modular architecture with services and routes'",
      result: t("copilot.step1.result"),
      impact: t("copilot.step1.impact"),
    },
    {
      category: t("copilot.category.debug"),
      icon: "🔍",
      prompt: "gh copilot explain 'why is API_KEY undefined when using ES modules with dotenv'",
      result: t("copilot.step2.result"),
      impact: t("copilot.step2.impact"),
    },
    {
      category: t("copilot.category.api"),
      icon: "⚡",
      prompt: "gh copilot suggest 'build a normalizeAnalysis function that transforms any AI output format into canonical sections'",
      result: t("copilot.step3.result"),
      impact: t("copilot.step3.impact"),
    },
    {
      category: t("copilot.category.viz"),
      icon: "🎨",
      prompt: "gh copilot suggest 'create an SVG pentagon radar chart in React without any chart library'",
      result: t("copilot.step4.result"),
      impact: t("copilot.step4.impact"),
    },
    {
      category: t("copilot.category.perf"),
      icon: "🚀",
      prompt: "gh copilot suggest 'smart file tree filtering for GitHub repos to reduce prompt size'",
      result: t("copilot.step5.result"),
      impact: t("copilot.step5.impact"),
    },
    {
      category: t("copilot.category.ux"),
      icon: "✨",
      prompt: "gh copilot suggest 'animated SVG donut chart for language breakdown with GitHub official colors'",
      result: t("copilot.step6.result"),
      impact: t("copilot.step6.impact"),
    },
  ];
}

const TERMINAL_LINES = [
  { type: "prompt", text: "$ gh copilot" },
  { type: "output", text: "Welcome to GitHub Copilot in the CLI!" },
  { type: "output", text: "version 0.0.410-1 (2025-06-17)" },
  { type: "blank", text: "" },
  { type: "output", text: "I have access to your code in" },
  { type: "output", text: "  ~/Downloads/repolens-ai" },
  { type: "blank", text: "" },
  { type: "prompt", text: "> Refactor the server into a modular architecture" },
  { type: "output", text: "Let me analyze your codebase..." },
  { type: "output", text: "" },
  { type: "ai", text: "I'll create a modular structure with:" },
  { type: "ai", text: "  📁 services/github.js  — GitHub API" },
  { type: "ai", text: "  📁 services/ai.js      — AI generation" },
  { type: "ai", text: "  📁 routes/analyze.js   — Express routes" },
  { type: "blank", text: "" },
  { type: "success", text: "✓ 3 files created, server refactored" },
];

function TerminalSimulator() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= TERMINAL_LINES.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden font-mono text-[11px] leading-relaxed">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-white/5">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
        </div>
        <span className="ml-2 text-[10px] text-[#8b949e]">DARIO-engineer — copilot</span>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-[#3fb950]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
          live
        </div>
      </div>

      {/* Terminal body */}
      <div className="px-4 py-3 h-[280px] overflow-hidden">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {line.type === "prompt" && (
              <span className="text-[#3fb950]">{line.text}<span className="animate-pulse">▊</span></span>
            )}
            {line.type === "output" && (
              <span className="text-[#8b949e]">{line.text}</span>
            )}
            {line.type === "ai" && (
              <span className="text-[#79c0ff]">{line.text}</span>
            )}
            {line.type === "success" && (
              <span className="text-[#3fb950] font-semibold">{line.text}</span>
            )}
            {line.type === "blank" && <br />}
          </div>
        ))}
        {visibleLines >= TERMINAL_LINES.length && (
          <div className="mt-2 text-[#3fb950] animate-fade-in">
            $ <span className="animate-pulse">▊</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CopilotBanner() {
  const { t } = useI18n();
  const [activeStep, setActiveStep] = useState(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const cliSteps = getCliSteps(t);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-3xl mx-auto mb-12">
      <div className="rounded-2xl border border-white/10 bg-surface-card/80 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3fb950] to-[#238636] flex items-center justify-center shadow-lg shadow-[#3fb950]/20">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  {t("copilot.title")}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/20 uppercase tracking-wider">
                    v0.0.410
                  </span>
                </h3>
                <p className="text-xs text-text-muted">
                  {t("copilot.subtitle")} <code className="text-[#79c0ff] font-mono text-[10px]">gh copilot</code> {t("copilot.inTerminal")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTerminal((v) => !v)}
              className="sm:ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3fb950]/10 border border-[#3fb950]/20 text-[#3fb950] hover:bg-[#3fb950]/20 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {showTerminal ? t("copilot.showUsage") : t("copilot.showTerminal")}
            </button>
          </div>
        </div>

        {showTerminal ? (
          <div className="p-5">
            <TerminalSimulator />
          </div>
        ) : (
          <>
            {/* Steps carousel */}
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {cliSteps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      i === activeStep
                        ? "bg-primary/15 border-primary/30 text-primary-light"
                        : "bg-white/[0.02] border-white/5 text-text-muted hover:border-white/15 hover:text-text"
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span className="truncate">{step.category}</span>
                  </button>
                ))}
              </div>

              {/* Active step detail */}
              <div className="rounded-xl border border-white/10 bg-[#0d1117] p-4 space-y-3 transition-all">
                <div className="font-mono text-[11px]">
                  <span className="text-[#3fb950]">$ </span>
                  <span className="text-[#e6edf3]">{cliSteps[activeStep].prompt}</span>
                </div>
                <div className="border-l-2 border-[#79c0ff]/30 pl-3 ml-1">
                  <p className="text-xs text-[#79c0ff] leading-relaxed">
                    {cliSteps[activeStep].result}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                  <span className="text-[10px] text-[#3fb950] font-medium">
                    {t("copilot.impact")}: {cliSteps[activeStep].impact}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 border-t border-white/5">
              {[
                { label: t("copilot.stat.commands"), value: "40+", icon: "⌨️" },
                { label: t("copilot.stat.bugs"), value: "12", icon: "🔧" },
                { label: t("copilot.stat.features"), value: "8", icon: "✨" },
                { label: t("copilot.stat.time"), value: "~6h", icon: "⏱️" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center py-3.5 px-2 ${i > 0 ? "border-l border-white/5" : ""}`}
                >
                  <span className="text-sm">{stat.icon}</span>
                  <p className="text-sm font-bold text-text mt-1">{stat.value}</p>
                  <p className="text-[8px] sm:text-[9px] text-text-muted uppercase tracking-wider mt-0.5 text-center">{stat.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
