import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = useCallback(() => {
    // Add transition class for smooth theme switch
    document.documentElement.classList.add('theme-transitioning');
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // Remove after transition completes
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 500);
  }, [theme, setTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 rounded-lg hover:bg-primary/5 relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
