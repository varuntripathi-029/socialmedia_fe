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
  // Sibling spacer *after* the sticky container, so following content can't
  // scroll in under a card that is still pinned.
  const releaseGapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wrappers = Array.from(container.querySelectorAll<HTMLElement>(':scope > .scroll-stack-card-wrapper'));
    const cards = wrappers.map(w => w.querySelector<HTMLElement>('.scroll-stack-card')).filter(Boolean) as HTMLElement[];
    if (!wrappers.length) return;

    const stickyTopFor = (i: number) => topOffset + i * stackOffset;

    wrappers.forEach((wrapper, i) => {
      wrapper.style.top = `${stickyTopFor(i)}px`;
      wrapper.style.zIndex = String(i + 1);
      // A short pinned pause after every card except the last, which gets a
      // real reading pause via its own margin instead of the release gap.
      wrapper.style.marginBottom = `${itemDistance}px`;
    });

    // Document-absolute trigger points, computed once against the page (not
    // the container), since sticky release/positioning is a page-scroll concept.
    let starts: number[] = [];
    const measureStarts = () => {
      starts = wrappers.map((wrapper, i) => wrapper.getBoundingClientRect().top + window.scrollY - stickyTopFor(i));
    };

    // Reserve enough space after the stack for the last card to fully release
    // from its pinned position and scroll out of view before the next section
    // can appear on screen, regardless of viewport height.
    const updateReleaseGap = () => {
      const lastIndex = wrappers.length - 1;
      const lastCard = cards[lastIndex];
      if (!releaseGapRef.current || !lastCard) return;
      const lastCardHeight = lastCard.getBoundingClientRect().height;
      const gap = Math.max(0, window.innerHeight - stickyTopFor(lastIndex) - lastCardHeight) + 40;
      releaseGapRef.current.style.height = `${gap}px`;
    };

    const recalculate = () => {
      measureStarts();
      updateReleaseGap();
    };
    recalculate();

    const update = () => {
      const scrollY = window.scrollY;

      wrappers.forEach((_wrapper, i) => {
        const card = cards[i];
        if (!card) return;

        let countAhead = 0;
        for (let j = i + 1; j < wrappers.length; j++) {
          const progress = Math.max(0, Math.min(1, (scrollY - starts[j]) / itemDistance));
          countAhead += progress;
        }

        const scale = Math.max(baseScale, 1 - countAhead * itemScale);
        const brightness = Math.max(0.75, 1 - countAhead * 0.06);

        card.style.transform = `scale(${scale.toFixed(4)})`;
        card.style.filter = `brightness(${brightness.toFixed(3)})`;
      });

      const lastStart = starts[wrappers.length - 1];
      const isStacked = scrollY >= lastStart;
      if (isStacked && !completedRef.current) {
        completedRef.current = true;
        onStackComplete?.();
      } else if (!isStacked && completedRef.current) {
        completedRef.current = false;
      }

      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      recalculate();
      onScroll();
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      completedRef.current = false;
    };
  }, [itemDistance, itemScale, baseScale, topOffset, stackOffset, onStackComplete]);

  return (
    <>
      <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
        {children}
      </div>
      <div ref={releaseGapRef} aria-hidden />
    </>
  );
};

export default ScrollStack;
