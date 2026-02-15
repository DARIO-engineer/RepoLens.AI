/**
 * HeroOrb — Animated CSS-only floating gradient orbs.
 * Creates a mesmerizing background effect for the hero section.
 * Zero dependencies, pure CSS animations with React.
 */
export default function HeroOrb() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Primary orb */}
      <div
        className="absolute rounded-full blur-[100px] opacity-[0.07]"
        style={{
          width: "600px", height: "600px",
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          top: "-200px", left: "50%", transform: "translateX(-50%)",
          animation: "orbFloat 8s ease-in-out infinite",
        }}
      />
      {/* Accent orb */}
      <div
        className="absolute rounded-full blur-[80px] opacity-[0.05]"
        style={{
          width: "400px", height: "400px",
          background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)",
          bottom: "-100px", right: "-100px",
          animation: "orbFloat 10s ease-in-out infinite reverse",
        }}
      />
      {/* Small green orb */}
      <div
        className="absolute rounded-full blur-[60px] opacity-[0.04]"
        style={{
          width: "300px", height: "300px",
          background: "radial-gradient(circle, #34d399 0%, transparent 70%)",
          bottom: "50px", left: "-50px",
          animation: "orbFloat 12s ease-in-out infinite 2s",
        }}
      />
      {/* Floating dots grid */}
      <div className="absolute inset-0" style={{ opacity: 0.3 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{
              left: `${(i * 17 + 10) % 100}%`,
              top: `${(i * 23 + 5) % 100}%`,
              opacity: 0.1 + (i % 4) * 0.05,
              animation: `dotPulse ${3 + (i % 3)}s ease-in-out infinite ${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
