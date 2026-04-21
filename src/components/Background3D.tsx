export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-background" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground) / 0.12) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.12) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Animated gradient orbs */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.07] floating"
        style={{
          background: 'radial-gradient(circle, hsl(243 75% 59%), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute -top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.05] floating-slow"
        style={{
          background: 'radial-gradient(circle, hsl(270 76% 72%), transparent 70%)',
          filter: 'blur(80px)',
          animationDelay: '-3s',
        }}
      />
      <div
        className="absolute -bottom-[15%] left-[30%] w-[700px] h-[700px] rounded-full opacity-[0.04] floating"
        style={{
          background: 'radial-gradient(circle, hsl(172 66% 50%), transparent 70%)',
          filter: 'blur(100px)',
          animationDelay: '-5s',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--background)) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
