import { useState } from 'react';

interface NinjaLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export default function NinjaLogo({ className = '', showText = true, size = 'md', dark = false }: NinjaLogoProps) {
  const [imageError, setImageError] = useState(false);

  const sizeMap = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className={`relative ${sizeMap[size]} rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-105 overflow-hidden`}>
        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        
        {!imageError ? (
          <img 
            src="/logo.png" 
            alt="User Ninjas Logo"
            className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback SVG
          <svg width={size === 'sm' ? 18 : size === 'md' ? 20 : 24} height={size === 'sm' ? 18 : size === 'md' ? 20 : 24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-500 group-hover:scale-110">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="hsl(var(--primary-foreground))" opacity="0.9"/>
            <path d="M2 17L12 22L22 17" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M2 12L12 17L22 12" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
          </svg>
        )}
      </div>
      {showText && (
        <span className={`font-display font-bold ${textSizeMap[size]} tracking-tight transition-all duration-300`}>
          <span className={dark ? 'text-white' : 'text-slate-900'}>User</span>
          <span className="text-primary group-hover:text-primary/80 transition-colors duration-300">Ninjas</span>
        </span>
      )}
    </div>
  );
}
