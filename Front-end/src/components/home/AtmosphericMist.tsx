"use client";

export default function AtmosphericMist() {
  return (
    <div className="relative h-32 md:h-48 -my-16 md:-my-24 z-20 pointer-events-none overflow-hidden">
      {/* Base fog gradient - blends section bg colors */}
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
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            linear-gradient(to bottom,
              transparent 0%,
              rgba(240,243,250,0.3) 15%,
              rgba(255,255,255,0.5) 40%,
              rgba(255,255,255,0.7) 50%,
              rgba(255,255,255,0.5) 60%,
              rgba(240,243,250,0.3) 85%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Soft center glow */}
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
            radial-gradient(ellipse 70% 60% at 50% 50%,
              rgba(255,255,255,0.35) 0%,
              rgba(240,243,250,0.15) 40%,
              transparent 70%
            )
          `,
          filter: "blur(30px)",
        }}
      />

      {/* Wide atmospheric spread */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 30% 50%,
              rgba(7,11,20,0.12) 0%,
              transparent 60%
            ),
            radial-gradient(ellipse 80% 45% at 70% 50%,
              rgba(7,11,20,0.10) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 30% 50%,
              rgba(243,245,250,0.12) 0%,
              transparent 60%
            ),
            radial-gradient(ellipse 80% 45% at 70% 50%,
              rgba(252,253,255,0.10) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
        }}
      />

      {/* Animated floating mist - left side */}
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
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 500px 180px at 25% 50%,
              rgba(255,255,255,0.08) 0%,
              transparent 60%
            )
          `,
          filter: "blur(60px)",
          animation: "mistDriftLeft 25s ease-in-out infinite",
        }}
      />

      {/* Animated floating mist - right side */}
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
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 400px 160px at 70% 50%,
              rgba(240,243,250,0.06) 0%,
              transparent 60%
            )
          `,
          filter: "blur(50px)",
          animation: "mistDriftRight 30s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes mistDriftLeft {
          0%, 100% { transform: translateX(-15px) translateY(0); opacity: 0.7; }
          25% { transform: translateX(10px) translateY(-8px); opacity: 1; }
          50% { transform: translateX(-5px) translateY(5px); opacity: 0.8; }
          75% { transform: translateX(20px) translateY(-3px); opacity: 0.9; }
        }
        @keyframes mistDriftRight {
          0%, 100% { transform: translateX(10px) translateY(5px); opacity: 0.6; }
          25% { transform: translateX(-15px) translateY(-5px); opacity: 0.9; }
          50% { transform: translateX(5px) translateY(10px); opacity: 0.7; }
          75% { transform: translateX(-10px) translateY(0); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
