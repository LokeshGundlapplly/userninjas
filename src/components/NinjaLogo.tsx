interface NinjaLogoProps {
  className?: string;
  showText?: boolean;
}

export default function NinjaLogo({ className = '', showText = true }: NinjaLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-105">
        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 group-hover:scale-110">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="hsl(var(--primary-foreground))" opacity="0.9"/>
          <path d="M2 17L12 22L22 17" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
          <path d="M2 12L12 17L22 12" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
        </svg>
      </div>
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight transition-all duration-300">
          <span className="text-foreground">User</span>
          <span className="text-primary group-hover:text-primary/80 transition-colors duration-300">Ninjas</span>
        </span>
      )}
    </div>
  );
}
