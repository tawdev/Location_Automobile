"use client";

export default function AtmosphericMist() {
  return (
    <div className="relative h-40 md:h-56 -my-10 md:-my-16 z-20 pointer-events-none overflow-hidden">
      {/* Dark mode base fog */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            linear-gradient(to bottom,
              transparent 0%,
              rgba(7,11,20,0.3) 15%,
              rgba(7,11,20,0.5) 40%,
              rgba(7,11,20,0.7) 50%,
              rgba(7,11,20,0.5) 60%,
              rgba(7,11,20,0.3) 85%,
              transparent 100%
            )
          `,
        }}
      />
      {/* Light mode base fog */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            linear-gradient(to bottom,
              transparent 0%,
              rgba(240,243,250,0.4) 10%,
              rgba(255,255,255,0.85) 35%,
              rgba(255,255,255,0.95) 50%,
              rgba(255,255,255,0.85) 65%,
              rgba(240,243,250,0.4) 90%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Center glow */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%,
              rgba(7,11,20,0.35) 0%,
              rgba(7,11,20,0.15) 40%,
              transparent 70%
            )
          `,
          filter: "blur(30px)",
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 50% 50%,
              rgba(255,255,255,0.6) 0%,
              rgba(240,243,250,0.3) 40%,
              transparent 70%
            )
          `,
          filter: "blur(40px)",
        }}
      />

      {/* Smoke wisp 1 - large, centered */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 600px 120px at 45% 48%,
              rgba(255,255,255,0.7) 0%,
              rgba(255,255,255,0.3) 35%,
              transparent 65%
            )
          `,
          filter: "blur(25px)",
          animation: "mistDriftLeft 20s ease-in-out infinite",
        }}
      />

      {/* Smoke wisp 2 - offset right */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 500px 100px at 65% 52%,
              rgba(255,255,255,0.55) 0%,
              rgba(240,243,250,0.25) 40%,
              transparent 65%
            )
          `,
          filter: "blur(30px)",
          animation: "mistDriftRight 25s ease-in-out infinite",
        }}
      />

      {/* Smoke wisp 3 - subtle, left-leaning */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 450px 90px at 30% 55%,
              rgba(255,255,255,0.4) 0%,
              rgba(240,243,250,0.15) 45%,
              transparent 70%
            )
          `,
          filter: "blur(35px)",
          animation: "mistDriftLeft 30s ease-in-out infinite 5s",
        }}
      />

      {/* Dark mode wisps */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 500px 180px at 25% 50%,
              rgba(7,11,20,0.08) 0%,
              transparent 60%
            )
          `,
          filter: "blur(60px)",
          animation: "mistDriftLeft 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 400px 160px at 70% 50%,
              rgba(7,11,20,0.06) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
          animation: "mistDriftRight 30s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes mistDriftLeft {
          0%, 100% { transform: translateX(-15px) translateY(0); opacity: 0.8; }
          25% { transform: translateX(10px) translateY(-8px); opacity: 1; }
          50% { transform: translateX(-5px) translateY(5px); opacity: 0.85; }
          75% { transform: translateX(20px) translateY(-3px); opacity: 0.95; }
        }
        @keyframes mistDriftRight {
          0%, 100% { transform: translateX(10px) translateY(5px); opacity: 0.7; }
          25% { transform: translateX(-15px) translateY(-5px); opacity: 1; }
          50% { transform: translateX(5px) translateY(10px); opacity: 0.8; }
          75% { transform: translateX(-10px) translateY(0); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
