import { useState, useEffect } from "react";
import { useI18n } from "../i18n";

function getSectionMeta(key, t) {
  const META = {
    RESUMO_ARQUITETURAL: {
      label: t("section.RESUMO_ARQUITETURAL"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: "from-primary/15 to-primary/5",
      border: "border-primary/20",
      iconBg: "bg-primary/15 text-primary-light",
    },
    STACK: {
      label: t("section.STACK"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      gradient: "from-accent/20 to-accent/5",
      border: "border-accent/20",
      iconBg: "bg-accent/15 text-accent",
    },
    PONTOS_FORTES: {
      label: t("section.PONTOS_FORTES"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-accent-green/20 to-accent-green/5",
      border: "border-accent-green/20",
      iconBg: "bg-accent-green/15 text-accent-green",
    },
    PONTOS_FRACOS: {
      label: t("section.PONTOS_FRACOS"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      gradient: "from-warning/20 to-warning/5",
      border: "border-warning/20",
      iconBg: "bg-warning/15 text-warning",
    },
    SUGESTOES_MELHORIA: {
      label: t("section.SUGESTOES_MELHORIA"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: "from-primary-light/20 to-primary-light/5",
      border: "border-primary-light/20",
      iconBg: "bg-primary-light/15 text-primary-light",
    },
    TAREFAS_INICIANTES: {
      label: t("section.TAREFAS_INICIANTES"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: "from-accent/20 to-accent-green/5",
      border: "border-accent/20",
      iconBg: "bg-accent/15 text-accent",
    },
  };
  return META[key] || null;
}

function parseSections(text) {
  const EXPECTED_KEYS = [
    "RESUMO_ARQUITETURAL",
    "STACK",
    "PONTOS_FORTES",
    "PONTOS_FRACOS",
    "SUGESTOES_MELHORIA",
    "TAREFAS_INICIANTES",
  ];

  const normalize = (str) =>
    str
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

  const fuzzyMatch = (raw) => {
    const n = normalize(raw);
    // Direct match
    const direct = EXPECTED_KEYS.find((k) => n === k);
    if (direct) return direct;
    // Contains match
    const contains = EXPECTED_KEYS.find((k) => n.includes(k) || k.includes(n));
    if (contains) return contains;
    // Word overlap match
    const words = n.split("_").filter(Boolean);
    return EXPECTED_KEYS.find((k) => {
      const kw = k.split("_");
      return words.some((w) => kw.some((ew) => ew.startsWith(w) || w.startsWith(ew)));
    });
  };

  // Split on any ## header (the server normalizes to this format)
  // Also handle ### and #### just in case, and bold **Section** headers
  const headerRegex = /^(?:#{2,4}\s+|(?:\d+[\.\)]\s+)?(?:\*\*))(.+?)(?:\*\*)?\s*$/gm;
  const sections = [];
  let lastIndex = 0;
  let lastKey = null;
  let match;

  // Collect all header positions
  const headers = [];
  while ((match = headerRegex.exec(text)) !== null) {
    const rawTitle = match[1]
      .replace(/^\d+[\.\)\-]\s*/, "")
      .replace(/\*\*/g, "")
      .replace(/[:：\-—]+$/, "")
      .trim();
    const key = fuzzyMatch(rawTitle) || normalize(rawTitle);
    headers.push({ key, index: match.index, endIndex: match.index + match[0].length });
  }

  // Also try splitting by clean "## KEY" if headerRegex didn't find enough
  if (headers.length < 3) {
    headers.length = 0; // reset
    const simpleRegex = /^##\s+(\S+)/gm;
    while ((match = simpleRegex.exec(text)) !== null) {
      const key = fuzzyMatch(match[1]) || normalize(match[1]);
      headers.push({ key, index: match.index, endIndex: match.index + match[0].length });
    }
  }

  if (headers.length === 0) {
    return [{ key: "RESUMO_ARQUITETURAL", content: text.trim() }];
  }

  for (let i = 0; i < headers.length; i++) {
    const contentStart = headers[i].endIndex;
    const contentEnd = i + 1 < headers.length ? headers[i + 1].index : text.length;
    const content = text.slice(contentStart, contentEnd).trim();
    if (content) {
      sections.push({ key: headers[i].key, content });
    }
  }

  return sections;
}

function renderContent(content) {
  const lines = content.split("\n").filter((l) => l.trim());

  // Detect definition-list style: lines like "**Label**: Description" or "**Label**\nDescription"
  const defListLines = lines.filter((l) => /^\*\*[^*]+\*\*\s*[:：]/.test(l.trim()));
  const isDefList = defListLines.length >= 2;

  // Detect if majority of non-empty lines are list items
  const listLines = lines.filter((l) => /^\s*[-*•]\s/.test(l));
  const isList = listLines.length > 0 && listLines.length >= lines.length * 0.4;

  if (isDefList) {
    // Render as definition list (Stack section style)
    const items = [];
    let currentItem = null;

    for (const line of lines) {
      const defMatch = line.trim().match(/^\*\*([^*]+)\*\*\s*[:：]\s*(.*)/);
      if (defMatch) {
        if (currentItem) items.push(currentItem);
        currentItem = { label: defMatch[1].trim(), value: defMatch[2].trim() };
      } else if (currentItem) {
        // Continuation line
        currentItem.value += (currentItem.value ? " " : "") + line.trim();
      } else {
        items.push({ label: null, value: line.trim() });
      }
    }
    if (currentItem) items.push(currentItem);

    return (
      <div className="space-y-2.5">
        {items.map((item, i) =>
          item.label ? (
            <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 text-sm">
              <span className="text-text font-semibold whitespace-nowrap shrink-0">
                {item.label}
              </span>
              <span className="text-text-muted leading-relaxed">{renderInlineFormatting(item.value)}</span>
            </div>
          ) : (
            <p key={i} className="text-sm text-text-muted leading-relaxed">{renderInlineFormatting(item.value)}</p>
          )
        )}
      </div>
    );
  }

  if (isList) {
    // Render mixed content: paragraphs above the list + the list
    const beforeList = [];
    const listItems = [];
    let seenList = false;
    for (const line of lines) {
      if (/^\s*[-*•]\s/.test(line)) {
        seenList = true;
        listItems.push(line.replace(/^\s*[-*•]\s*/, "").trim());
      } else if (!seenList) {
        beforeList.push(line);
      } else {
        // text after a list item — append to last item
        if (listItems.length > 0) {
          listItems[listItems.length - 1] += " " + line.trim();
        }
      }
    }

    return (
      <>
        {beforeList.length > 0 && (
          <div className="text-sm text-text-muted leading-relaxed space-y-2 mb-3">
            {beforeList.map((line, i) => (
              <p key={i}>{renderInlineFormatting(line)}</p>
            ))}
          </div>
        )}
        <ul className="space-y-2.5">
          {listItems.map((text, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-text-muted leading-relaxed group">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
              <span>{renderInlineFormatting(text)}</span>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="text-sm text-text-muted leading-relaxed space-y-2">
      {lines.map((line, i) => (
        <p key={i}>{renderInlineFormatting(line)}</p>
      ))}
    </div>
  );
}

function renderInlineFormatting(text) {
  if (typeof text !== "string") return text;
  // Handle **bold** and `code` inline
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="text-text font-medium">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-surface/80 text-accent text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function LoadingMessages() {
  const [msgIndex, setMsgIndex] = useState(0);
  const { t } = useI18n();

  const messages = [
    t("analysis.loading1"), t("analysis.loading2"),
    t("analysis.loading3"), t("analysis.loading4"),
    t("analysis.loading5"), t("analysis.loading6"),
    t("analysis.loading7"), t("analysis.loading8"),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="h-5 overflow-hidden">
      <p className="text-sm animate-fade-in" key={msgIndex}>
        {messages[msgIndex]}
      </p>
    </div>
  );
}

function SkeletonCard({ delay = 0 }) {
  return (
    <div className="rounded-xl border border-white/5 bg-surface-card/60 p-5 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="skeleton h-4 w-36" />
      </div>
      <div className="space-y-2.5">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-11/12" />
        <div className="skeleton h-3 w-4/5" />
        <div className="skeleton h-3 w-9/12" />
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-surface-light/80 border border-white/10 text-text-muted hover:text-text hover:border-white/20 hover:bg-surface-light"
      title="Copiar análise"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t("analysis.copied")}
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {t("analysis.copy")}
        </>
      )}
    </button>
  );
}

function ExportButton({ text, repoName }) {
  const { t } = useI18n();
  const handleExport = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repolens-${repoName || "analysis"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer bg-surface-light/80 border border-white/10 text-text-muted hover:text-text hover:border-white/20 hover:bg-surface-light"
      title="Exportar como Markdown"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {t("analysis.export")}
    </button>
  );
}

export default function AnalysisResult({ analysis, loading, duration, repoName }) {
  const { t } = useI18n();
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pb-12 space-y-4">
        <div className="flex flex-col items-center justify-center gap-4 mb-8 text-text-muted">
          <div className="relative w-24 h-24">
            {/* Outer orbit */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-spin" style={{ animationDuration: '8s' }} />
            {/* Middle orbit */}
            <div className="absolute inset-3 rounded-full border border-primary/20 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
            {/* Inner orbit */}
            <div className="absolute inset-6 rounded-full border border-accent/15 animate-spin" style={{ animationDuration: '3s' }} />
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary-light shadow-lg shadow-primary/40" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-lg shadow-accent/40" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-green shadow-lg shadow-accent-green/40" />
            </div>
            {/* Center pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 animate-pulse" />
              <div className="absolute w-3 h-3 rounded-full bg-primary-light/60" />
            </div>
          </div>
          <LoadingMessages />
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} delay={i * 100} />
        ))}
      </div>
    );
  }

  if (!analysis) return null;

  const sections = parseSections(analysis);

  return (
    <div id="analysis-results" className="max-w-3xl md:max-w-4xl mx-auto pb-12 space-y-4">
      {/* Results header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent sm:hidden" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium uppercase tracking-widest whitespace-nowrap">{t("analysis.resultTitle")}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-green/15 text-accent-green border border-accent-green/20">
              {sections.length} {t("analysis.sections")}
            </span>
            {duration > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary-light border border-primary/20">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(duration / 1000).toFixed(1)}s
              </span>
            )}
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <CopyButton text={analysis} />
          <ExportButton text={analysis} repoName={repoName} />
        </div>
      </div>

      {/* Responsive grid: PONTOS_FORTES + PONTOS_FRACOS side-by-side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, index) => {
          const meta = getSectionMeta(section.key, t) || {
            label: section.key.replace(/_/g, " "),
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: "from-white/10 to-white/5",
            border: "border-white/10",
            iconBg: "bg-white/10 text-text-muted",
          };

          // Strengths & Weaknesses are paired side-by-side on desktop, all others span full width
          const isPaired = section.key === "PONTOS_FORTES" || section.key === "PONTOS_FRACOS";

          return (
            <div
              key={index}
              className={`animate-fade-in rounded-xl border ${meta.border} bg-gradient-to-br ${meta.gradient} backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:border-white/15 hover:-translate-y-0.5 ${isPaired ? "" : "md:col-span-2"}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center shrink-0`}>
                  {meta.icon}
                </div>
                <h3 className="text-base font-semibold text-text">{meta.label}</h3>
              </div>
              {renderContent(section.content)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
