import { useEffect, useCallback } from 'react';

/**
 * Attaches mousemove listeners to all `.spotlight-card` elements
 * so the CSS pseudo-element spotlight actually follows the cursor.
 */
export function useSpotlightCards() {
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = (e.currentTarget as HTMLElement);
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.spotlight-card');
    cards.forEach((card) => card.addEventListener('mousemove', handleMouseMove));
    return () => {
      cards.forEach((card) => card.removeEventListener('mousemove', handleMouseMove));
    };
  });
}
