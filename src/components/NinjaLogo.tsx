interface NinjaLogoProps {
  className?: string;
  showText?: boolean;
}

export default function NinjaLogo({ className = "", showText = true }: NinjaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 bg-ninja-dark rounded-full flex items-center justify-center overflow-hidden">
        {/* Face */}
        <div className="absolute w-8 h-8 bg-amber-200 rounded-full top-1" />
        {/* Mask */}
        <div className="absolute w-full h-3 bg-ninja-dark top-3.5" />
        {/* Eyes */}
        <div className="absolute flex gap-2 top-4">
          <div className="w-1.5 h-1 bg-white rounded-full" />
          <div className="w-1.5 h-1 bg-white rounded-full" />
        </div>
        {/* Headband */}
        <div className="absolute w-full h-2.5 bg-primary top-2.5" />
        {/* Headband tails */}
        <div className="absolute right-0 top-3 w-3 h-1.5 bg-primary rotate-12 origin-left" />
        <div className="absolute right-0 top-4 w-2.5 h-1 bg-primary rotate-6 origin-left" />
      </div>
      {showText && (
        <span className="font-display font-bold text-xl">
          <span className="text-foreground">User</span>
          <span className="text-primary"> Ninjas</span>
        </span>
      )}
    </div>
  );
}
