import { useState, useEffect } from "react";
import { useI18n } from "../i18n";

/**
 * HealthRadar — SVG pentagon radar chart that evaluates a repo on 5 dimensions.
 * Scores are computed from GitHub API metadata (no AI needed — instant).
 */

const DIMENSION_KEYS = [
  { key: "community", icon: "👥" },
  { key: "activity", icon: "⚡" },
  { key: "documentation", icon: "📄" },
  { key: "popularity", icon: "⭐" },
  { key: "maintenance", icon: "🔧" },
];

function computeScores(repoData) {
  const s = {};

  // Community (0-100): forks + contributors signal
  const forks = repoData.forks_count || 0;
  s.community = Math.min(100, Math.round(
    (Math.log10(forks + 1) / Math.log10(5000)) * 60 +
    (repoData.subscribers_count ? Math.min(40, Math.log10(repoData.subscribers_count + 1) * 20) : 20)
  ));

  // Activity (0-100): recent push, issues, PRs
  const daysSinceUpdate = repoData.pushed_at
    ? (Date.now() - new Date(repoData.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  const activityFromPush = daysSinceUpdate < 1 ? 100 : daysSinceUpdate < 7 ? 85 : daysSinceUpdate < 30 ? 65 : daysSinceUpdate < 90 ? 40 : daysSinceUpdate < 365 ? 20 : 5;
  const issueActivity = Math.min(30, (repoData.open_issues_count || 0) * 0.5);
  s.activity = Math.min(100, Math.round(activityFromPush * 0.7 + issueActivity));

  // Documentation (0-100): has description, homepage, topics, license
  let docScore = 0;
  if (repoData.description) docScore += 25;
  if (repoData.homepage) docScore += 20;
  if (repoData.license) docScore += 25;
  if (repoData.topics?.length > 0) docScore += 15;
  if (repoData.has_wiki) docScore += 15;
  s.documentation = Math.min(100, docScore);

  // Popularity (0-100): stars based
  const stars = repoData.stargazers_count || 0;
  s.popularity = Math.min(100, Math.round(
    stars >= 10000 ? 95 + Math.min(5, (stars - 10000) / 10000) :
    stars >= 1000 ? 70 + (stars - 1000) / 9000 * 25 :
    stars >= 100 ? 40 + (stars - 100) / 900 * 30 :
    stars >= 10 ? 15 + (stars - 10) / 90 * 25 :
    stars * 1.5
  ));

  // Maintenance (0-100): archived, disabled, default branch protection signals
  let maintScore = 50; // baseline
  if (repoData.archived) maintScore = 5;
  else if (repoData.disabled) maintScore = 10;
  else {
    if (daysSinceUpdate < 30) maintScore += 25;
    else if (daysSinceUpdate < 90) maintScore += 15;
    if (repoData.has_issues) maintScore += 10;
    if (repoData.license) maintScore += 10;
    if (forks > 10) maintScore += 5;
  }
  s.maintenance = Math.min(100, Math.round(maintScore));

  return s;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function HealthRadar({ repoData }) {
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredDim, setHoveredDim] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!repoData) return;
    let frame;
    let start = null;
    const duration = 1000;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [repoData]);

  if (!repoData) return null;

  const scores = computeScores(repoData);
  const overall = Math.round(
    DIMENSION_KEYS.reduce((sum, d) => sum + (scores[d.key] || 0), 0) / DIMENSION_KEYS.length
  );

  // SVG params
  const size = 220;
  const cx = size / 2, cy = size / 2;
  const maxR = 85;
  const levels = 4;
  const angleStep = 360 / DIMENSION_KEYS.length;

  // Grid polygons (background rings)
  const gridPolygons = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    const r = (maxR / levels) * lvl;
    const points = DIMENSION_KEYS.map((_, i) => {
      const p = polarToCartesian(cx, cy, r, i * angleStep);
      return `${p.x},${p.y}`;
    }).join(" ");
    gridPolygons.push(points);
  }

  // Data polygon
  const dataPoints = DIMENSION_KEYS.map((d, i) => {
    const score = (scores[d.key] || 0) / 100;
    const r = maxR * score * animProgress;
    return polarToCartesian(cx, cy, r, i * angleStep);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Label positions (slightly outside)
  const labels = DIMENSION_KEYS.map((d, i) => {
    const p = polarToCartesian(cx, cy, maxR + 22, i * angleStep);
    return { ...d, label: t(`health.${d.key}`), x: p.x, y: p.y, score: scores[d.key] || 0 };
  });

  // Overall score color
  const scoreColor = overall >= 75 ? "#34d399" : overall >= 50 ? "#fbbf24" : overall >= 25 ? "#fb923c" : "#f87171";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Grid */}
          {gridPolygons.map((pts, i) => (
            <polygon
              key={i}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {/* Axis lines */}
          {DIMENSION_KEYS.map((_, i) => {
            const p = polarToCartesian(cx, cy, maxR, i * angleStep);
            return (
              <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            );
          })}
          {/* Data area */}
          <polygon
            points={dataPolygon}
            fill="rgba(99, 102, 241, 0.15)"
            stroke="#818cf8"
            strokeWidth={2}
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
          {/* Data points */}
          {dataPoints.map((p, i) => {
            const dim = DIMENSION_KEYS[i];
            const isHov = hoveredDim === dim.key;
            return (
              <circle
                key={dim.key}
                cx={p.x} cy={p.y}
                r={isHov ? 5 : 3.5}
                fill={isHov ? "#818cf8" : "#6366f1"}
                stroke="#0b1120"
                strokeWidth={2}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredDim(dim.key)}
                onMouseLeave={() => setHoveredDim(null)}
              />
            );
          })}
          {/* Labels */}
          {labels.map((l) => {
            const isHov = hoveredDim === l.key;
            return (
              <g key={l.key} className="cursor-pointer" onMouseEnter={() => setHoveredDim(l.key)} onMouseLeave={() => setHoveredDim(null)}>
                <text
                  x={l.x} y={l.y - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-current transition-colors duration-200"
                  style={{ fill: isHov ? "#f1f5f9" : "#94a3b8" }}
                >
                  {l.icon} {l.label}
                </text>
                <text
                  x={l.x} y={l.y + 8}
                  textAnchor="middle"
                  className="text-[11px] font-bold transition-colors duration-200"
                  style={{ fill: isHov ? "#818cf8" : "#64748b" }}
                >
                  {Math.round(l.score * animProgress)}
                </text>
              </g>
            );
          })}
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black leading-none" style={{ color: scoreColor }}>
            {Math.round(overall * animProgress)}
          </span>
          <span className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wider">Score</span>
        </div>
      </div>
    </div>
  );
}
