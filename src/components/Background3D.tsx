export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Base mesh gradient */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* Aurora bands — slowly drifting color washes */}
      <div
        className="absolute w-[140%] h-[45%] -left-[20%] top-[0%] blur-[100px] opacity-[0.07]"
        style={{
          background: 'linear-gradient(95deg, transparent 0%, hsl(262,83%,58%) 35%, hsl(173,58%,39%) 65%, transparent 100%)',
          animation: 'float-slow 14s ease-in-out infinite',
          transform: 'rotate(-6deg)',
        }}
      />
      <div
        className="absolute w-[140%] h-[35%] -left-[20%] bottom-[10%] blur-[110px] opacity-[0.05]"
        style={{
          background: 'linear-gradient(95deg, transparent 0%, hsl(37,95%,55%) 30%, hsl(230,60%,52%) 70%, transparent 100%)',
          animation: 'float-slow 18s ease-in-out infinite 3s reverse',
          transform: 'rotate(4deg)',
        }}
      />

      {/* Primary large orb — top left */}
      <div
        className="absolute rounded-full blur-[160px]"
        style={{
          width: '650px', height: '650px',
          background: 'hsl(262, 83%, 62%)',
          top: '2%', left: '8%',
          opacity: 0.065,
          animation: 'float-slow 9s ease-in-out infinite',
        }}
      />
      {/* Teal orb — right middle */}
      <div
        className="absolute rounded-full blur-[130px]"
        style={{
          width: '500px', height: '500px',
          background: 'hsl(173, 58%, 44%)',
          top: '40%', right: '5%',
          opacity: 0.05,
          animation: 'float-slow 11s ease-in-out infinite 2s',
        }}
      />
      {/* Gold orb — bottom center */}
      <div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: '380px', height: '380px',
          background: 'hsl(37, 95%, 60%)',
          bottom: '12%', left: '38%',
          opacity: 0.04,
          animation: 'float-slow 7s ease-in-out infinite 1s',
        }}
      />
      {/* Indigo orb — mid left */}
      <div
        className="absolute rounded-full blur-[90px]"
        style={{
          width: '260px', height: '260px',
          background: 'hsl(230, 60%, 55%)',
          top: '58%', left: '12%',
          opacity: 0.035,
          animation: 'float-slow 13s ease-in-out infinite 4s',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: 'linear-gradient(hsl(230, 25%, 20%) 1px, transparent 1px), linear-gradient(90deg, hsl(230, 25%, 20%) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}

