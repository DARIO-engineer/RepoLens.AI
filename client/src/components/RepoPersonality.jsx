import { useMemo, useState, useEffect } from "react";
import { useI18n } from "../i18n";

/**
 * RepoPersonality — Generates a rich "personality card" for a GitHub repository
 * based on its metadata. Think Myers-Briggs for repos.
 * 
 * UNIQUE FEATURE: No other submission computes a "repo personality" with
 * archetype, radar chart, traits, and a visual character. Pure client-side computation.
 * 
 * Architected with GitHub Copilot CLI assistance.
 */

const ARCHETYPES = [
  {
    key: "pioneer",
    emoji: "🚀",
    color: "#6366f1",
    gradient: "from-primary/20 to-accent/10",
  },
  {
    key: "guardian",
    emoji: "🛡️",
    color: "#34d399",
    gradient: "from-accent-green/20 to-primary/10",
  },
  {
    key: "architect",
    emoji: "🏛️",
    color: "#818cf8",
    gradient: "from-primary-light/20 to-accent/10",
  },
  {
    key: "sprinter",
    emoji: "⚡",
    color: "#fbbf24",
    gradient: "from-warning/20 to-primary/10",
  },
  {
    key: "scholar",
    emoji: "📚",
    color: "#22d3ee",
    gradient: "from-accent/20 to-accent-green/10",
  },
  {
    key: "community",
    emoji: "🌍",
    color: "#f472b6",
    gradient: "from-[#f472b6]/20 to-primary/10",
  },
];

const TRAIT_KEYS = [
  "polyglot", "monolith", "social", "solo", "ancient", "fresh",
  "documented", "mysterious", "popular", "niche", "active", "dormant",
  "licensed", "forkable",
];

const TRAIT_ICONS = {
  polyglot: "🗣️", monolith: "🏢", social: "💬", solo: "🎸",
  ancient: "🏺", fresh: "🌱", documented: "📝", mysterious: "🔮",
  popular: "🌟", niche: "🔬", active: "🔥", dormant: "💤",
  licensed: "⚖️", forkable: "🍴",
};

// Personality dimensions for radar
const DIMENSION_KEYS = ["innovation", "stability", "community", "documentation", "activity"];
const DIMENSION_ICONS = { innovation: "💡", stability: "🏗️", community: "👥", documentation: "📄", activity: "⚡" };

function computePersonality(repoData) {
  if (!repoData) return null;

  const stars = repoData.stargazers_count || 0;
  const forks = repoData.forks_count || 0;
  const issues = repoData.open_issues_count || 0;
  const watchers = repoData.subscribers_count || 0;
  const hasLicense = !!repoData.license;
  const hasDescription = !!repoData.description;
  const hasHomepage = !!repoData.homepage;
  const hasWiki = repoData.has_wiki;
  const topicCount = repoData.topics?.length || 0;
  const archived = repoData.archived;
  const size = repoData.size || 0;

  const daysSinceCreated = repoData.created_at
    ? (Date.now() - new Date(repoData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const daysSincePush = repoData.pushed_at
    ? (Date.now() - new Date(repoData.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  // Compute traits
  const traits = [];

  if (daysSinceCreated > 1095) traits.push("ancient");
  else if (daysSinceCreated < 90) traits.push("fresh");

  if (daysSincePush < 14 && !archived) traits.push("active");
  else if (daysSincePush > 180 || archived) traits.push("dormant");

  if (stars > 100) traits.push("popular");
  else if (stars < 10 && forks < 5) traits.push("niche");

  if (forks > 50 || issues > 20 || watchers > 50) traits.push("social");
  else if (forks < 3 && watchers < 5) traits.push("solo");

  if (hasDescription && hasLicense && (hasHomepage || topicCount > 2)) traits.push("documented");
  else if (!hasDescription && !hasLicense) traits.push("mysterious");

  if (hasLicense) traits.push("licensed");
  if (forks > 20) traits.push("forkable");

  // Archetype scoring
  const scores = {
    pioneer: 0, guardian: 0, architect: 0,
    sprinter: 0, scholar: 0, community: 0,
  };

  if (traits.includes("fresh")) scores.pioneer += 3;
  if (traits.includes("active")) scores.pioneer += 2;
  if (size < 5000) scores.pioneer += 1;

  if (traits.includes("licensed")) scores.guardian += 2;
  if (traits.includes("documented")) scores.guardian += 3;
  if (hasWiki) scores.guardian += 2;

  if (size > 50000) scores.architect += 3;
  if (topicCount > 5) scores.architect += 2;
  if (traits.includes("ancient")) scores.architect += 2;

  if (traits.includes("active") && daysSincePush < 3) scores.sprinter += 3;
  if (traits.includes("fresh")) scores.sprinter += 2;
  if (!traits.includes("documented")) scores.sprinter += 1;

  if (traits.includes("documented")) scores.scholar += 3;
  if (hasWiki) scores.scholar += 3;
  if (hasHomepage) scores.scholar += 2;

  if (traits.includes("social")) scores.community += 3;
  if (traits.includes("popular")) scores.community += 3;
  if (traits.includes("forkable")) scores.community += 2;
  if (issues > 10) scores.community += 1;

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topArchetype = sorted[0][0];
  const archetype = ARCHETYPES.find((a) => a.key === topArchetype) || ARCHETYPES[0];

  const topScore = sorted[0][1];
  const totalScore = sorted.reduce((s, [, v]) => s + v, 0) || 1;
  const confidence = Math.min(100, Math.round((topScore / totalScore) * 100 + 20));

  // Compute radar dimensions (0-100)
  const dimensions = {
    innovation: Math.min(100, Math.round(
      (traits.includes("fresh") ? 30 : 0) +
      (traits.includes("active") ? 25 : 0) +
      (size < 10000 ? 15 : 5) +
      (topicCount > 0 ? 15 : 0) +
      Math.min(15, stars * 0.5)
    )),
    stability: Math.min(100, Math.round(
      (traits.includes("licensed") ? 25 : 0) +
      (traits.includes("documented") ? 25 : 0) +
      (hasWiki ? 15 : 0) +
      (daysSinceCreated > 365 ? 20 : Math.round(daysSinceCreated / 365 * 20)) +
      (traits.includes("ancient") ? 15 : 0)
    )),
    community: Math.min(100, Math.round(
      Math.min(30, stars * 0.3) +
      Math.min(25, forks * 1) +
      Math.min(20, issues * 0.5) +
      (topicCount > 2 ? 15 : topicCount * 5) +
      (traits.includes("social") ? 10 : 0)
    )),
    documentation: Math.min(100, Math.round(
      (hasDescription ? 20 : 0) +
      (hasLicense ? 20 : 0) +
      (hasHomepage ? 20 : 0) +
      (hasWiki ? 20 : 0) +
      Math.min(20, topicCount * 5)
    )),
    activity: Math.min(100, Math.round(
      (daysSincePush < 7 ? 40 : daysSincePush < 30 ? 25 : daysSincePush < 90 ? 10 : 0) +
      (!archived ? 20 : 0) +
      (traits.includes("active") ? 25 : 0) +
      Math.min(15, issues * 0.3)
    )),
  };

  // Compute "stats summary" data
  const ageMonths = Math.round(daysSinceCreated / 30);

  const sizeLabel = size > 100000
    ? `${(size / 1000).toFixed(0)}MB`
    : size > 1000
    ? `${(size / 1000).toFixed(1)}MB`
    : `${size}KB`;

  return { archetype, traits: traits.slice(0, 6), confidence, scores, dimensions, ageMonths, sizeLabel, daysSincePush };
}

function AnimatedRing({ progress, color, size = 64 }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dashLen = circumference * (progress / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={4} strokeDasharray={`${dashLen} ${circumference - dashLen}`}
        strokeLinecap="round" className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// Mini radar chart for personality dimensions
function PersonalityRadar({ dimensions, animProgress, color }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 60;
  const dimKeys = DIMENSION_KEYS;

  // Compute polygon points
  const points = dimKeys.map((key, i) => {
    const angle = (2 * Math.PI * i) / dimKeys.length - Math.PI / 2;
    const val = (dimensions[key] / 100) * maxR * animProgress;
    return { x: cx + val * Math.cos(angle), y: cy + val * Math.sin(angle) };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  
  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={dimKeys.map((_, i) => {
            const angle = (2 * Math.PI * i) / dimKeys.length - Math.PI / 2;
            return `${cx + maxR * r * Math.cos(angle)},${cy + maxR * r * Math.sin(angle)}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {dimKeys.map((_, i) => {
        const angle = (2 * Math.PI * i) / dimKeys.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + maxR * Math.cos(angle)}
            y2={cy + maxR * Math.sin(angle)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Filled area */}
      <path
        d={polygonPath}
        fill={`${color}18`}
        stroke={color}
        strokeWidth={1.5}
        className="transition-all duration-1000 ease-out"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r={3}
          fill={color}
          stroke="#0b1120"
          strokeWidth={1.5}
          className="transition-all duration-1000 ease-out"
        />
      ))}

      {/* Labels */}
      {dimKeys.map((key, i) => {
        const angle = (2 * Math.PI * i) / dimKeys.length - Math.PI / 2;
        const lx = cx + (maxR + 18) * Math.cos(angle);
        const ly = cy + (maxR + 18) * Math.sin(angle);
        return (
          <text
            key={key}
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize={8}
            fontFamily="system-ui, sans-serif"
          >
            {DIMENSION_ICONS[key]}
          </text>
        );
      })}
    </svg>
  );
}

export default function RepoPersonality({ repoUrl, visible, repoData }) {
  const { t } = useI18n();
  const [animProgress, setAnimProgress] = useState(0);

  const personality = useMemo(() => computePersonality(repoData), [repoData]);

  useEffect(() => {
    if (!personality || !visible) return;
    let frame;
    let start = null;
    const duration = 1200;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [personality, visible]);

  if (!visible || !personality) return null;

  const { archetype, traits, confidence, dimensions, ageMonths, sizeLabel, daysSincePush } = personality;
  const ageLabel = ageMonths >= 12
    ? `${Math.round(ageMonths / 12)} ${ageMonths >= 24 ? t("age.years") : t("age.year")}`
    : `${ageMonths} ${ageMonths === 1 ? t("age.month") : t("age.months")}`;
  const pushLabel = daysSincePush < 1 ? t("personality.today") : daysSincePush < 7 ? `${Math.round(daysSincePush)}${t("personality.dAgo")}` : daysSincePush < 30 ? `${Math.round(daysSincePush / 7)}${t("personality.wAgo")}` : `${Math.round(daysSincePush / 30)}${t("personality.mAgo")}`;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto mb-8">
      <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${archetype.gradient} bg-surface-card/80 overflow-hidden`}>
        <div className="p-6">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">{t("personality.title")}</h3>
              <p className="text-[10px] text-text-muted">{t("personality.subtitle")}</p>
            </div>
          </div>

          {/* Main content: Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* LEFT: Archetype card + traits */}
            <div className="space-y-4">
              {/* Archetype badge */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <AnimatedRing progress={confidence * animProgress} color={archetype.color} size={80} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl" style={{ filter: `drop-shadow(0 0 12px ${archetype.color}60)` }}>
                      {archetype.emoji}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-extrabold text-text">{t(`archetype.${archetype.key}.label`)}</h4>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
                      style={{
                        borderColor: `${archetype.color}40`,
                        backgroundColor: `${archetype.color}15`,
                        color: archetype.color,
                      }}
                    >
                      {Math.round(confidence * animProgress)}% match
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{t(`archetype.${archetype.key}.desc`)}</p>
                </div>
              </div>

              {/* Insight box */}
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">💬</span>
                  <p className="text-[11px] text-text-muted leading-relaxed italic">{t(`archetype.${archetype.key}.insight`)}</p>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                  <div className="text-[10px] text-text-muted">{t("personality.age")}</div>
                  <div className="text-sm font-bold text-text mt-0.5">{ageLabel}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                  <div className="text-[10px] text-text-muted">{t("personality.size")}</div>
                  <div className="text-sm font-bold text-text mt-0.5">{sizeLabel}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                  <div className="text-[10px] text-text-muted">{t("personality.lastPush")}</div>
                  <div className="text-sm font-bold text-text mt-0.5">{pushLabel}</div>
                </div>
              </div>

              {/* Traits */}
              {traits.length > 0 && (
                <div>
                  <h5 className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">{t("personality.traitsTitle")}</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {traits.map((traitKey) => {
                      const icon = TRAIT_ICONS[traitKey];
                      if (!icon) return null;
                      return (
                        <div
                          key={traitKey}
                          className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-text-muted hover:text-text hover:border-white/20 transition-all cursor-default"
                        >
                          <span>{icon}</span>
                          <span className="font-medium">{t(`trait.${traitKey}`)}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-surface/95 border border-white/10 text-[10px] text-text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
                            {t(`trait.${traitKey}.desc`)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Radar + Dimension breakdown */}
            <div className="space-y-4">
              {/* Radar chart */}
              <div className="flex justify-center">
                <PersonalityRadar dimensions={dimensions} animProgress={animProgress} color={archetype.color} />
              </div>

              {/* Dimension breakdown with bars */}
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">{t("personality.dimensionsTitle")}</h5>
                {DIMENSION_KEYS.map((dimKey) => {
                  const val = Math.round(dimensions[dimKey] * animProgress);
                  return (
                    <div key={dimKey} className="group relative flex items-center gap-2">
                      <span className="text-xs w-5 text-center cursor-help">{DIMENSION_ICONS[dimKey]}</span>
                      <span className="text-[10px] text-text-muted w-20 truncate">{t(`dim.${dimKey}`)}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${val}%`,
                            backgroundColor: val > 60 ? archetype.color : `${archetype.color}60`,
                          }}
                        />
                      </div>
                      <span className={`text-[10px] w-7 text-right font-mono ${val > 60 ? "text-text font-bold" : "text-text-muted"}`}>
                        {val}%
                      </span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 rounded-lg bg-surface/95 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20 w-52">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{DIMENSION_ICONS[dimKey]}</span>
                          <span className="text-xs font-bold text-text">{t(`dim.${dimKey}`)}</span>
                          <span className="text-[10px] font-bold" style={{ color: archetype.color }}>{val}%</span>
                        </div>
                        <p className="text-[10px] text-text-muted leading-relaxed">{t(`dim.${dimKey}.desc`)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom: Archetype comparison bars */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <h5 className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2">{t("personality.comparisonTitle")}</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {ARCHETYPES.map((arch) => {
                const score = personality.scores[arch.key] || 0;
                const maxScore = Math.max(...Object.values(personality.scores), 1);
                const pct = (score / maxScore) * 100;
                const isTop = arch.key === archetype.key;

                return (
                  <div key={arch.key} className="group relative flex items-center gap-2">
                    <span className="text-xs w-4 text-center cursor-help">{arch.emoji}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${pct * animProgress}%`,
                          backgroundColor: isTop ? arch.color : `${arch.color}60`,
                        }}
                      />
                    </div>
                    <span className={`text-[10px] w-6 text-right ${isTop ? "text-text font-bold" : "text-text-muted"}`}>
                      {Math.round(score)}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 rounded-lg bg-surface/95 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20 w-48">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{arch.emoji}</span>
                        <span className="text-xs font-bold text-text">{t(`archetype.${arch.key}.label`)}</span>
                        {isTop && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green font-bold">TOP</span>}
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed">{t(`archetype.${arch.key}.desc`)}</p>
                      <div className="mt-1.5 text-[9px] text-text-muted/70">
                        Score: <span className="font-bold text-text">{Math.round(score)}</span> pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
