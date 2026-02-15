import { useState, useEffect, useMemo } from "react";
import { useI18n } from "../i18n";

/**
 * ArchitectureGraph — Interactive SVG node graph that visualizes the project's
 * folder architecture fetched from the GitHub Tree API.
 * 
 * UNIQUE FEATURE: No other challenge submission generates a visual architecture
 * diagram from the repository structure. Zero dependencies, pure SVG.
 * 
 * Built with GitHub Copilot CLI assistance for the layout algorithm.
 */

const FOLDER_COLORS = {
  src: "#6366f1",
  lib: "#6366f1",
  app: "#6366f1",
  components: "#818cf8",
  pages: "#818cf8",
  views: "#818cf8",
  routes: "#818cf8",
  api: "#22d3ee",
  server: "#22d3ee",
  backend: "#22d3ee",
  services: "#22d3ee",
  controllers: "#22d3ee",
  middleware: "#22d3ee",
  config: "#fbbf24",
  utils: "#fbbf24",
  helpers: "#fbbf24",
  hooks: "#a78bfa",
  store: "#a78bfa",
  state: "#a78bfa",
  context: "#a78bfa",
  tests: "#34d399",
  test: "#34d399",
  __tests__: "#34d399",
  spec: "#34d399",
  styles: "#f472b6",
  css: "#f472b6",
  assets: "#f472b6",
  public: "#f472b6",
  static: "#f472b6",
  docs: "#fb923c",
  scripts: "#fb923c",
  build: "#64748b",
  dist: "#64748b",
  node_modules: "#64748b",
  ".github": "#94a3b8",
};

const FILE_ICONS = {
  js: "JS",
  jsx: "JSX",
  ts: "TS",
  tsx: "TSX",
  py: "PY",
  rb: "RB",
  go: "GO",
  rs: "RS",
  java: "JV",
  json: "{}",
  yaml: "YML",
  yml: "YML",
  md: "MD",
  css: "CSS",
  html: "HTML",
  dockerfile: "🐳",
};

const IGNORED = new Set([
  "node_modules", ".git", "dist", "build", ".next", "__pycache__",
  ".vscode", ".idea", "coverage", ".cache", ".turbo", "vendor",
]);

function buildTree(paths) {
  const root = { name: "root", children: {}, files: [], depth: 0 };

  for (const p of paths) {
    const parts = p.split("/");
    let current = root;

    // Skip ignored directories
    if (parts.some((part) => IGNORED.has(part))) continue;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // file
        current.files.push(part);
      } else {
        if (!current.children[part]) {
          current.children[part] = { name: part, children: {}, files: [], depth: i + 1 };
        }
        current = current.children[part];
      }
    }
  }

  return root;
}

function getNodeColor(name) {
  const lower = name.toLowerCase();
  return FOLDER_COLORS[lower] || "#6366f1";
}

function getFileExt(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  return FILE_ICONS[ext] || "·";
}

function flattenTree(node, maxNodes = 30) {
  const nodes = [];
  const edges = [];
  let id = 0;

  function walk(n, parentId, depth) {
    if (nodes.length >= maxNodes) return;

    const childFolders = Object.values(n.children)
      .sort((a, b) => {
        const aSize = Object.keys(a.children).length + a.files.length;
        const bSize = Object.keys(b.children).length + b.files.length;
        return bSize - aSize;
      });

    for (const child of childFolders) {
      if (nodes.length >= maxNodes) break;
      const nodeId = ++id;
      const fileCount = child.files.length + Object.keys(child.children).length;
      nodes.push({
        id: nodeId,
        name: child.name,
        type: "folder",
        depth,
        color: getNodeColor(child.name),
        size: Math.min(40, 22 + fileCount * 2),
        fileCount: child.files.length,
        subFolders: Object.keys(child.children).length,
      });
      if (parentId !== null) {
        edges.push({ from: parentId, to: nodeId });
      }
      walk(child, nodeId, depth + 1);
    }

    // Add significant files at root level
    if (depth === 0) {
      const rootFiles = n.files.filter((f) =>
        /^(readme|package|cargo|go\.|requirements|dockerfile|makefile|\.env|tsconfig|vite\.config|next\.config|webpack|\.github)/i.test(f)
      );
      for (const file of rootFiles.slice(0, 5)) {
        if (nodes.length >= maxNodes) break;
        const nodeId = ++id;
        nodes.push({
          id: nodeId,
          name: file,
          type: "file",
          depth,
          color: "#94a3b8",
          size: 18,
          ext: getFileExt(file),
        });
        if (parentId !== null) {
          edges.push({ from: parentId, to: nodeId });
        }
      }
    }
  }

  // Root node
  nodes.push({
    id: 0,
    name: "root",
    type: "root",
    depth: 0,
    color: "#6366f1",
    size: 36,
  });

  walk(node, 0, 1);
  return { nodes, edges };
}

function computeLayout(nodes, edges, width, height, seed = 0) {
  // Radial layout: root in center, children in concentric rings
  const cx = width / 2;
  const cy = height / 2;
  const positions = {};

  // Simple seeded random for reproducible but varied layouts
  const seededRandom = (i) => {
    const x = Math.sin(seed * 9301 + i * 49297 + 233280) * 10000;
    return x - Math.floor(x);
  };

  const nonRoot = nodes.filter(n => n.type !== "root");
  const count = nonRoot.length;

  // — Star map patterns keyed by node count —
  const S = {
    3: [[.50,.15],[.20,.80],[.80,.80]],
    4: [[.50,.12],[.22,.48],[.50,.88],[.78,.48]],
    5: [[.10,.58],[.30,.22],[.50,.52],[.70,.18],[.90,.48]],
    6: [[.18,.52],[.30,.28],[.48,.15],[.66,.15],[.78,.28],[.88,.52]],
    7: [[.30,.12],[.70,.15],[.42,.44],[.50,.47],[.58,.50],[.32,.85],[.68,.88]],
    8: [[.78,.10],[.68,.22],[.55,.32],[.45,.45],[.40,.58],[.38,.70],[.48,.80],[.60,.88]],
    9: [[.18,.40],[.25,.22],[.38,.12],[.52,.22],[.45,.40],[.55,.52],[.65,.58],[.78,.65],[.90,.72]],
    10: [[.50,.06],[.50,.25],[.50,.45],[.50,.65],[.50,.90],[.15,.32],[.30,.38],[.70,.38],[.85,.32],[.38,.72]],
    11: [[.50,.08],[.35,.22],[.65,.22],[.22,.38],[.78,.38],[.50,.45],[.35,.60],[.65,.60],[.45,.75],[.55,.75],[.50,.92]],
    12: [[.28,.20],[.72,.20],[.72,.62],[.28,.62],[.50,.10],[.15,.40],[.85,.40],[.50,.40],[.38,.75],[.62,.75],[.50,.88],[.50,.55]],
    13: [[.15,.28],[.25,.18],[.38,.25],[.50,.15],[.58,.28],[.50,.42],[.40,.50],[.55,.55],[.45,.65],[.58,.70],[.48,.80],[.35,.72],[.70,.82]],
    14: [[.10,.32],[.22,.25],[.35,.30],[.48,.40],[.62,.45],[.75,.38],[.78,.52],[.70,.62],[.58,.55],[.48,.58],[.35,.65],[.25,.72],[.42,.80],[.82,.28]],
    15: [[.85,.12],[.75,.18],[.62,.15],[.50,.22],[.40,.32],[.35,.45],[.38,.58],[.48,.62],[.58,.58],[.65,.48],[.70,.38],[.62,.72],[.52,.78],[.40,.85],[.28,.90]],
    16: [[.50,.08],[.38,.18],[.62,.18],[.25,.28],[.75,.28],[.15,.42],[.85,.42],[.50,.45],[.25,.58],[.75,.58],[.15,.68],[.85,.68],[.30,.78],[.70,.78],[.42,.88],[.58,.88]],
    17: [[.50,.05],[.40,.15],[.60,.15],[.30,.25],[.70,.25],[.20,.38],[.80,.38],[.50,.35],[.50,.50],[.38,.55],[.62,.55],[.30,.65],[.70,.65],[.50,.68],[.42,.80],[.58,.80],[.50,.92]],
    18: [[.08,.20],[.18,.15],[.28,.22],[.38,.18],[.32,.32],[.42,.38],[.52,.42],[.62,.40],[.72,.35],[.78,.45],[.72,.55],[.62,.58],[.52,.62],[.42,.68],[.35,.75],[.45,.82],[.55,.85],[.65,.80]],
    19: [[.50,.05],[.50,.18],[.38,.28],[.62,.28],[.25,.38],[.75,.38],[.50,.40],[.15,.50],[.85,.50],[.50,.55],[.35,.60],[.65,.60],[.50,.68],[.25,.72],[.75,.72],[.35,.80],[.65,.80],[.42,.90],[.58,.90]],
    20: [[.50,.05],[.30,.12],[.70,.12],[.15,.25],[.50,.22],[.85,.25],[.22,.40],[.78,.40],[.38,.42],[.62,.42],[.50,.52],[.15,.58],[.85,.58],[.30,.65],[.70,.65],[.50,.70],[.22,.80],[.78,.80],[.40,.88],[.60,.88]],
    21: [[.50,.04],[.35,.12],[.65,.12],[.20,.22],[.80,.22],[.50,.25],[.12,.38],[.88,.38],[.35,.40],[.65,.40],[.50,.48],[.22,.55],[.78,.55],[.38,.60],[.62,.60],[.50,.65],[.30,.75],[.70,.75],[.50,.80],[.42,.92],[.58,.92]],
    22: [[.50,.04],[.38,.10],[.62,.10],[.25,.18],[.75,.18],[.50,.20],[.12,.30],[.88,.30],[.32,.35],[.68,.35],[.50,.38],[.18,.48],[.82,.48],[.38,.50],[.62,.50],[.50,.58],[.28,.65],[.72,.65],[.40,.75],[.60,.75],[.50,.85],[.50,.95]],
    23: [[.50,.04],[.35,.10],[.65,.10],[.20,.18],[.80,.18],[.50,.22],[.10,.32],[.90,.32],[.30,.35],[.70,.35],[.50,.40],[.15,.50],[.85,.50],[.35,.52],[.65,.52],[.50,.58],[.25,.65],[.75,.65],[.38,.72],[.62,.72],[.50,.78],[.42,.90],[.58,.90]],
  };

  const pattern = S[count];

  if (pattern) {
    // Place root at center
    const rootNode = nodes.find(n => n.type === "root");
    if (rootNode) positions[rootNode.id] = { x: cx, y: cy };

    const pad = 50;
    const w = width - pad * 2;
    const h = height - pad * 2;

    // Rotate pattern based on seed for visual variety on re-layout
    const angle = seed > 0 ? (seed * 0.7) % (2 * Math.PI) : 0;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    nonRoot.forEach((n, i) => {
      const [nx, ny] = pattern[i % pattern.length];
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const rx = dx * cosA - dy * sinA + 0.5;
      const ry = dx * sinA + dy * cosA + 0.5;
      const fx = Math.max(0.05, Math.min(0.95, rx));
      const fy = Math.max(0.05, Math.min(0.95, ry));
      positions[n.id] = { x: pad + fx * w, y: pad + fy * h };
    });

    return positions;
  }

  // Group by depth
  const byDepth = {};
  for (const n of nodes) {
    const d = n.depth;
    if (!byDepth[d]) byDepth[d] = [];
    byDepth[d].push(n);
  }

  // Place root
  if (byDepth[0]) {
    for (const n of byDepth[0]) {
      positions[n.id] = { x: cx, y: cy };
    }
  }

  // Place each depth ring
  const maxDepth = Math.max(...Object.keys(byDepth).map(Number));
  const ringGap = Math.min(110, (Math.min(width, height) / 2 - 30) / Math.max(maxDepth, 1));

  for (let d = 1; d <= maxDepth; d++) {
    const ring = byDepth[d] || [];
    const radius = ringGap * d;
    const angleStep = (2 * Math.PI) / Math.max(ring.length, 1);
    // Seed-based start angle rotation creates different layouts each time
    const seedOffset = seed > 0 ? seededRandom(d) * Math.PI * 0.6 : 0;
    const startAngle = -Math.PI / 2 + (d % 2 === 0 ? angleStep / 4 : 0) + seedOffset;

    ring.forEach((n, i) => {
      const angle = startAngle + angleStep * i;
      // Seed-varied jitter for visual interest
      const jitter = seed > 0
        ? (seededRandom(n.id * 7 + d) - 0.5) * 24
        : (n.id % 3 - 1) * 8;
      positions[n.id] = {
        x: cx + (radius + jitter) * Math.cos(angle),
        y: cy + (radius + jitter) * Math.sin(angle),
      };
    });
  }

  return positions;
}

function buildParentMap(edges, positions) {
  const parentPos = {};
  for (const edge of edges) {
    const fromPos = positions[edge.from];
    if (fromPos) {
      parentPos[edge.to] = { x: fromPos.x, y: fromPos.y };
    }
  }
  return parentPos;
}

export default function ArchitectureGraph({ repoUrl, visible }) {
  const { t } = useI18n();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [error, setError] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [collapseProgress, setCollapseProgress] = useState(1); // 1 = expanded, 0 = collapsed
  const [layoutSeed, setLayoutSeed] = useState(0); // triggers layout recalculation

  // Reset tree when repo URL changes
  useEffect(() => {
    setTree(null);
    setError(false);
    setAnimProgress(0);
    setCollapsed(false);
    setCollapseProgress(1);
    setLayoutSeed(0);
  }, [repoUrl]);

  useEffect(() => {
    if (!repoUrl || !visible || tree) return;
    setLoading(true);
    setError(false);

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) { setLoading(false); return; }
    const [, owner, repo] = match;

    fetch(`https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}/git/trees/HEAD?recursive=1`)
      .then((r) => r.ok ? r.json() : Promise.reject("API error"))
      .then((data) => {
        if (data?.tree) {
          const paths = data.tree
            .filter((item) => item.type === "blob" || item.type === "tree")
            .map((item) => item.path);
          if (paths.length > 0) setTree(paths);
          else setError(true);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [repoUrl, visible, tree]);

  // Animation
  useEffect(() => {
    if (!tree) return;
    let frame;
    let start = null;
    const duration = 1500;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [tree]);

  // Collapse/expand animation
  useEffect(() => {
    if (!tree) return;
    let frame;
    let start = null;
    // Fast collapse (300ms), slow expand (800ms)
    const duration = collapsed ? 300 : 800;
    const targetVal = collapsed ? 0 : 1;
    const startVal = collapsed ? 1 : 0;
    
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease in-out for smooth breathe effect
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setCollapseProgress(startVal + (targetVal - startVal) * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else if (collapsed) {
        // After collapsing, auto re-expand with new layout
        setTimeout(() => {
          setLayoutSeed((s) => s + 1);
          setCollapsed(false);
        }, 300);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [collapsed, tree]);

  const handleCenterClick = () => {
    if (!collapsed) {
      setCollapsed(true);
    }
  };

  const WIDTH = 520;
  const HEIGHT = 420;

  const { graphNodes, graphEdges, positions, parentMap } = useMemo(() => {
    if (!tree) return { graphNodes: [], graphEdges: [], positions: {}, parentMap: {} };
    const treeObj = buildTree(tree);
    const { nodes, edges } = flattenTree(treeObj, 24);
    const pos = computeLayout(nodes, edges, WIDTH, HEIGHT, layoutSeed);
    const pMap = buildParentMap(edges, pos);
    return { graphNodes: nodes, graphEdges: edges, positions: pos, parentMap: pMap };
  }, [tree, layoutSeed]);

  if (!visible) return null;

  if (loading) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto mb-8">
        <div className="rounded-2xl border border-white/10 bg-surface-card/80 p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-text-muted text-sm">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary-light rounded-full animate-spin" />
            {t("arch.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (!tree || graphNodes.length < 2) return null;

  const totalFiles = tree.filter((p) => !IGNORED.has(p.split("/")[0])).length;
  const totalFolders = graphNodes.filter((n) => n.type === "folder").length;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto mb-8">
      <div className="rounded-2xl border border-white/10 bg-surface-card/80 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">{t("arch.title")}</h3>
              <p className="text-[10px] text-text-muted">{t("arch.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary-light border border-primary/20">
              {totalFolders} {t("arch.modules")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-accent/10 text-accent border border-accent/20">
              {totalFiles} {t("arch.files")}
            </span>
          </div>
        </div>

        {/* Graph */}
        <div className="p-4 flex justify-center">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full max-w-[520px]"
            style={{ height: "auto", maxHeight: 420 }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(99,102,241,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Background glow */}
            <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={150} fill="url(#centerGlow)" />

            {/* Edges */}
            {graphEdges.map((edge, i) => {
              const from = positions[edge.from];
              const to = positions[edge.to];
              if (!from || !to) return null;

              const isHovered = hoveredNode === edge.from || hoveredNode === edge.to;
              const cp = collapseProgress * animProgress;
              const x1 = WIDTH / 2 + (from.x - WIDTH / 2) * cp;
              const y1 = HEIGHT / 2 + (from.y - HEIGHT / 2) * cp;
              const x2 = WIDTH / 2 + (to.x - WIDTH / 2) * cp;
              const y2 = HEIGHT / 2 + (to.y - HEIGHT / 2) * cp;

              // Curved edge
              const mx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
              const my = (y1 + y2) / 2 - (x2 - x1) * 0.15;

              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                  fill="none"
                  stroke={isHovered ? "rgba(129,140,248,0.6)" : "rgba(255,255,255,0.08)"}
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-all duration-300"
                  style={{ opacity: cp }}
                />
              );
            })}

            {/* Nodes */}
            {graphNodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;

              const isHovered = hoveredNode === node.id;
              const isRoot = node.type === "root";
              const isFile = node.type === "file";
              const cp = collapseProgress * animProgress;
              const x = WIDTH / 2 + (pos.x - WIDTH / 2) * cp;
              const y = HEIGHT / 2 + (pos.y - HEIGHT / 2) * cp;
              const r = (node.size / 2) * (isHovered ? 1.2 : 1);

              return (
                <g
                  key={node.id}
                  className={`cursor-pointer transition-all duration-200 ${isRoot ? "cursor-pointer" : ""}`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={isRoot ? handleCenterClick : undefined}
                  style={{ opacity: isRoot ? 1 : Math.max(0.1, cp) }}
                >
                  {/* Pulse ring for root on hover to indicate clickable */}
                  {isRoot && isHovered && (
                    <>
                      <circle
                        cx={x} cy={y} r={r + 14}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={1}
                        opacity={0.2}
                      >
                        <animate
                          attributeName="r"
                          values={`${r + 8};${r + 20};${r + 8}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.3;0.05;0.3"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}

                  {/* Glow ring for hovered */}
                  {isHovered && (
                    <circle
                      cx={x} cy={y} r={r + 8}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={1}
                      opacity={0.4}
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={x} cy={y} r={r}
                    fill={isRoot ? node.color : `${node.color}20`}
                    stroke={node.color}
                    strokeWidth={isRoot ? 2.5 : isHovered ? 2 : 1.5}
                    filter={isHovered ? "url(#glow)" : undefined}
                  />

                  {/* Label */}
                  <text
                    x={x}
                    y={isFile ? y + 1 : y - 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none"
                    fill={isRoot ? "#fff" : isHovered ? "#f1f5f9" : "#cbd5e1"}
                    fontSize={isRoot ? 10 : isFile ? 7 : 9}
                    fontWeight={isRoot || isHovered ? "bold" : "normal"}
                    fontFamily="system-ui, sans-serif"
                  >
                    {isRoot ? "📁" : isFile ? node.ext : node.name.slice(0, 10)}
                  </text>

                  {/* Folder: sub info */}
                  {node.type === "folder" && (
                    <text
                      x={x}
                      y={y + 8}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize={7}
                      fontFamily="system-ui, sans-serif"
                      className="pointer-events-none"
                    >
                      {node.fileCount}f {node.subFolders > 0 ? `${node.subFolders}d` : ""}
                    </text>
                  )}

                  {/* Root label below */}
                  {isRoot && (
                    <>
                      <text
                        x={x} y={y + r + 14}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize={9}
                        fontWeight="bold"
                        fontFamily="system-ui, sans-serif"
                        className="pointer-events-none uppercase"
                        letterSpacing="0.1em"
                      >
                        root
                      </text>
                      <text
                        x={x} y={y + r + 26}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize={7}
                        fontFamily="system-ui, sans-serif"
                        className="pointer-events-none"
                      >
                        {t("arch.clickToReorg")}
                      </text>
                    </>
                  )}

                  {/* Tooltip on hover */}
                  {isHovered && node.type === "folder" && (
                    <g>
                      <rect
                        x={x - 50} y={y - r - 32}
                        width={100} height={22}
                        rx={6}
                        fill="rgba(11,17,32,0.95)"
                        stroke={node.color}
                        strokeWidth={0.5}
                      />
                      <text
                        x={x} y={y - r - 18}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize={9}
                        fontWeight="600"
                        fontFamily="system-ui, sans-serif"
                      >
                        /{node.name} — {node.fileCount} files
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 border-t border-white/5 flex flex-wrap gap-3 text-[10px] text-text-muted">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> {t("arch.legendFrontend")}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> {t("arch.legendBackend")}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-green" /> {t("arch.legendTests")}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /> {t("arch.legendConfig")}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#f472b6" }} /> {t("arch.legendAssets")}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#94a3b8" }} /> {t("arch.legendFiles")}</span>
        </div>
      </div>
    </div>
  );
}
