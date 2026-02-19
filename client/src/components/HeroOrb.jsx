/**
 * HeroOrb — Animated CSS-only floating gradient orbs.
 * Creates a mesmerizing warm atmospheric background for the hero section.
 * Zero dependencies, pure CSS animations with React.
 */
export default function HeroOrb() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Primary warm orb */}
      <div
        className="absolute rounded-full blur-[120px] opacity-[0.06]"
        style={{
          width: "700px", height: "700px",
          background: "radial-gradient(circle, #e8915a 0%, #d17a42 30%, transparent 70%)",
          top: "-250px", left: "50%", transform: "translateX(-50%)",
          animation: "orbFloat 10s ease-in-out infinite",
        }}
      />
      {/* Teal accent orb */}
      <div
        className="absolute rounded-full blur-[90px] opacity-[0.045]"
        style={{
          width: "450px", height: "450px",
          background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)",
          bottom: "-120px", right: "-80px",
          animation: "orbFloat 12s ease-in-out infinite reverse",
        }}
      />
      {/* Soft gold orb */}
      <div
        className="absolute rounded-full blur-[70px] opacity-[0.035]"
        style={{
          width: "350px", height: "350px",
          background: "radial-gradient(circle, #f5b87a 0%, transparent 70%)",
          bottom: "80px", left: "-60px",
          animation: "orbFloat 14s ease-in-out infinite 3s",
        }}
      />
      {/* Floating particles — warm-tinted star field */}
      <div className="absolute inset-0" style={{ opacity: 0.25 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + (i % 3) * 0.5}px`,
              height: `${1 + (i % 3) * 0.5}px`,
              background: i % 3 === 0 ? '#f5b87a' : i % 3 === 1 ? '#2dd4bf' : '#e2e8f0',
              left: `${(i * 17 + 10) % 100}%`,
              top: `${(i * 23 + 5) % 100}%`,
              opacity: 0.08 + (i % 4) * 0.04,
              animation: `dotPulse ${3 + (i % 4)}s ease-in-out infinite ${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
