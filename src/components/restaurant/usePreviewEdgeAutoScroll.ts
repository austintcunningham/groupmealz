"use client";

import { useEffect, type RefObject } from "react";

/** Distance from top/bottom of scroll area where auto-scroll begins (px). */
const EDGE_PX = 88;
/** Max scroll speed per animation frame (px). */
const MAX_SPEED = 24;

/**
 * Smooth edge auto-scroll while dragging inside a fixed-height preview panel.
 * Uses rAF (not interval) so it feels immediate when the pointer nears the edge.
 */
export function usePreviewEdgeAutoScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  dragging: boolean
) {
  useEffect(() => {
    if (!dragging) return;

    let pointerY = 0;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointerY = e.clientY;
    };

    const tick = () => {
      const el = scrollRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const distFromTop = pointerY - rect.top;
        const distFromBottom = rect.bottom - pointerY;

        if (distFromTop >= 0 && distFromTop < EDGE_PX) {
          const intensity = 1 - distFromTop / EDGE_PX;
          el.scrollTop -= MAX_SPEED * intensity * intensity;
        } else if (distFromBottom >= 0 && distFromBottom < EDGE_PX) {
          const intensity = 1 - distFromBottom / EDGE_PX;
          el.scrollTop += MAX_SPEED * intensity * intensity;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [dragging, scrollRef]);
}
