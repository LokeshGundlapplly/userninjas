import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur' | 'zoom-up' | 'slide-blur' | 'pop' | 'rotate-in' | 'slide-right' | 'clip-up';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

const animationClasses: Record<AnimationType, { initial: string; visible: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    initial: 'opacity-0 -translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'scale': {
    initial: 'opacity-0 scale-[0.9]',
    visible: 'opacity-100 scale-100',
  },
  'blur': {
    initial: 'opacity-0 blur-sm scale-[0.96]',
    visible: 'opacity-100 blur-0 scale-100',
  },
  'zoom-up': {
    initial: 'opacity-0 scale-[0.85] translate-y-6',
    visible: 'opacity-100 scale-100 translate-y-0',
  },
  'slide-blur': {
    initial: 'opacity-0 translate-y-6 blur-[6px]',
    visible: 'opacity-100 translate-y-0 blur-0',
  },
  'pop': {
    initial: 'opacity-0 scale-[0.8]',
    visible: 'opacity-100 scale-100',
  },
  'rotate-in': {
    initial: 'opacity-0 rotate-3 translate-y-4',
    visible: 'opacity-100 rotate-0 translate-y-0',
  },
  'slide-right': {
    initial: 'opacity-0 -translate-x-10',
    visible: 'opacity-100 translate-x-0',
  },
  'clip-up': {
    initial: 'opacity-0 [clip-path:inset(100%_0_0_0)]',
    visible: 'opacity-100 [clip-path:inset(0_0_0_0)]',
  },
};

export default function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 650,
  className,
  threshold = 0.08,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold });

  const { initial, visible } = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        isVisible ? visible : initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
