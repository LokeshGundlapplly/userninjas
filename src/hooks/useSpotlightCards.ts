import { useEffect } from 'react';

/**
 * Attaches a single global mousemove listener to document
 * so any element with `.spotlight-card` (even dynamically added ones)
 * gets its --mouse-x and --mouse-y CSS variables updated.
 */
export function useSpotlightCards() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest<HTMLElement>('.spotlight-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
}
