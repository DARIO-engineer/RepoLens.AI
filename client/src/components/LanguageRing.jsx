import { useState, useEffect } from "react";

// GitHub official language colors
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219",
  "C++": "#f34b7d", C: "#555555", "C#": "#178600", Go: "#00ADD8", Rust: "#dea584",
  Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
  Lua: "#000080", Shell: "#89e051", HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c",
  Vue: "#41b883", Svelte: "#ff3e00", QML: "#44a51c", Nix: "#7e7eff", Zig: "#ec915c",
  Haskell: "#5e5086", Elixir: "#6e4a7e", Scala: "#c22d40", R: "#198CE7",
  Jupyter: "#DA5B0B", Markdown: "#083fa1", Dockerfile: "#384d54", Makefile: "#427819",
  CMake: "#DA3434", Vim: "#199f4b", Perl: "#0298c3",
};

const DEFAULT_COLOR = "#6366f1";

function getColor(lang, index) {
  if (LANG_COLORS[lang]) return LANG_COLORS[lang];
  const hue = (index * 67 + 200) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export default function LanguageRing({ repoUrl }) {
  const [languages, setLanguages] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if (!repoUrl) return;
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const [, owner, repo] = match;

    fetch(`https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}/languages`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && Object.keys(data).length > 0) setLanguages(data);
      })
      .catch(() => {});
  }, [repoUrl]);

  // Animate the ring on mount
  useEffect(() => {
    if (!languages) return;
    let frame;
    let start = null;
    const duration = 1200;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [languages]);

  if (!languages) return null;

  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;

  const topLangs = entries.slice(0, 8);
  const otherBytes = entries.slice(8).reduce((s, [, v]) => s + v, 0);
  if (otherBytes > 0) topLangs.push(["Other", otherBytes]);

  // SVG donut parameters
  const cx = 80, cy = 80, r = 62, strokeWidth = 14;
  const circumference = 2 * Math.PI * r;

  // Build arcs
  let accumulated = 0;
  const arcs = topLangs.map(([lang, bytes], i) => {
    const pct = bytes / total;
    const offset = accumulated;
    accumulated += pct;
    return { lang, bytes, pct, offset, color: getColor(lang, i) };
  });

  const primaryLang = entries[0]?.[0] || "N/A";
  const primaryPct = ((entries[0]?.[1] || 0) / total * 100).toFixed(0);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          {/* Language arcs */}
          {arcs.map((arc, i) => {
            const dashLen = circumference * arc.pct * animProgress;
            const dashOffset = -circumference * arc.offset * animProgress;
            const isHovered = hovered === arc.lang;
            return (
              <circle
                key={arc.lang}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                className="transition-all duration-300"
                style={{ filter: isHovered ? `drop-shadow(0 0 6px ${arc.color}80)` : "none", opacity: hovered && !isHovered ? 0.4 : 1 }}
                onMouseEnter={() => setHovered(arc.lang)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-lg font-bold text-text leading-none">{primaryPct}%</span>
          <span className="text-[10px] text-text-muted mt-1 max-w-[60px] truncate text-center">{primaryLang}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 max-w-[220px]">
        {arcs.map((arc) => (
          <button
            key={arc.lang}
            className="flex items-center gap-1.5 text-[10px] cursor-pointer transition-opacity duration-200 hover:opacity-100"
            style={{ opacity: hovered && hovered !== arc.lang ? 0.4 : 1 }}
            onMouseEnter={() => setHovered(arc.lang)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-text-muted font-medium">{arc.lang}</span>
            <span className="text-text-muted/60">{(arc.pct * 100).toFixed(1)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
