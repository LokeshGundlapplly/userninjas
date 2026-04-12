import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  const handleScroll = useCallback(() => {
    const winH = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = winH > 0 ? window.scrollY / winH : 0;
    setProgress(Math.min(scrolled, 1));
    setShowTop(window.scrollY > 600);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px]">
        <div
          className="h-full bg-gradient-to-r from-primary via-[hsl(270_76%_62%)] to-[hsl(var(--teal))] transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 left-6 z-50 w-10 h-10 rounded-xl bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-primary/10 transition-all duration-300 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </>
  );
}
