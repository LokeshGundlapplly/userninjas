export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Warm mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Floating orbs */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] animate-float"
        style={{ background: 'hsl(37, 95%, 55%)', top: '10%', left: '15%' }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05] animate-float"
        style={{ background: 'hsl(230, 60%, 52%)', top: '50%', right: '10%', animationDelay: '1.5s' }}
      />
      <div 
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.04] animate-float"
        style={{ background: 'hsl(37, 95%, 65%)', bottom: '10%', left: '40%', animationDelay: '3s' }}
      />
      
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(hsl(230, 25%, 20%) 1px, transparent 1px), linear-gradient(90deg, hsl(230, 25%, 20%) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
