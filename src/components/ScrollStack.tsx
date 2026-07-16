import React, { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className="scroll-stack-card-wrapper sticky">
    <div
      className={`scroll-stack-card w-full origin-top will-change-transform ${itemClassName}`.trim()}
      style={{ backfaceVisibility: 'hidden' }}
    >
      {children}
    </div>
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  /** Vertical scroll distance (px) over which a card transitions from active to stacked. */
  itemDistance?: number;
  /** Scale removed per card stacked behind the active one. */
  itemScale?: number;
  /** Floor scale a stacked card can shrink to. */
  baseScale?: number;
  /** Distance (px) from the top of the viewport where the first card pins. */
  topOffset?: number;
  /** Vertical peek (px) revealed above each subsequently stacked card. */
  stackOffset?: number;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 140,
  itemScale = 0.03,
  baseScale = 0.88,
  topOffset = 96,
  stackOffset = 20,
  onStackComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wrappers = Array.from(container.querySelectorAll<HTMLElement>(':scope > .scroll-stack-card-wrapper'));
    const cards = wrappers.map(w => w.querySelector<HTMLElement>('.scroll-stack-card')).filter(Boolean) as HTMLElement[];

    wrappers.forEach((wrapper, i) => {
      const stickyTop = topOffset + i * stackOffset;
      wrapper.style.top = `${stickyTop}px`;
      wrapper.style.zIndex = String(i + 1);
      if (i < wrappers.length - 1) wrapper.style.marginBottom = `${itemDistance}px`;
    });

    const startFor = (i: number) => wrappers[i].offsetTop - (topOffset + i * stackOffset);

    const update = () => {
      const scrollY = window.scrollY;

      wrappers.forEach((_wrapper, i) => {
        const card = cards[i];
        if (!card) return;

        let countAhead = 0;
        for (let j = i + 1; j < wrappers.length; j++) {
          const start = startFor(j);
          const progress = Math.max(0, Math.min(1, (scrollY - start) / itemDistance));
          countAhead += progress;
        }

        const scale = Math.max(baseScale, 1 - countAhead * itemScale);
        const brightness = Math.max(0.75, 1 - countAhead * 0.06);

        card.style.transform = `scale(${scale.toFixed(4)})`;
        card.style.filter = `brightness(${brightness.toFixed(3)})`;
      });

      if (wrappers.length) {
        const lastStart = startFor(wrappers.length - 1);
        const isStacked = scrollY >= lastStart;
        if (isStacked && !completedRef.current) {
          completedRef.current = true;
          onStackComplete?.();
        } else if (!isStacked && completedRef.current) {
          completedRef.current = false;
        }
      }

      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      completedRef.current = false;
    };
  }, [itemDistance, itemScale, baseScale, topOffset, stackOffset, onStackComplete]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
      {children}
      <div className="pb-24" />
    </div>
  );
};

export default ScrollStack;
