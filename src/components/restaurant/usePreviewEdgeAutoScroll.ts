"use client";

import { useEffect, type RefObject } from "react";

/** Distance from top/bottom of scroll area where auto-scroll begins (px). */
const EDGE_PX = 100;
/** Max scroll speed per animation frame (px). */
const MAX_SPEED = 28;

type ScrollSurface =
  | { kind: "element"; el: HTMLElement; rect: DOMRect }
  | { kind: "window"; rect: { top: number; bottom: number } };

function pickScrollSurface(
  scrollRef: RefObject<HTMLDivElement | null>,
  preferViewport: boolean
): ScrollSurface {
  const el = scrollRef.current;
  if (!preferViewport && el && el.scrollHeight > el.clientHeight + 4) {
    return { kind: "element", el, rect: el.getBoundingClientRect() };
  }
  return { kind: "window", rect: { top: 0, bottom: window.innerHeight } };
}

function applyScroll(surface: ScrollSurface, delta: number) {
  if (delta === 0) return;
  if (surface.kind === "element") {
    surface.el.scrollTop += delta;
  } else {
    window.scrollBy({ top: delta, left: 0, behavior: "auto" });
  }
}

/**
 * Smooth edge auto-scroll while dragging in the menu preview.
 * Scrolls the preview panel when it has its own overflow, otherwise the page (full editor layout).
 */
export function usePreviewEdgeAutoScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  dragging: boolean,
  preferViewport = false
) {
  useEffect(() => {
    if (!dragging) return;

    let pointerY = 0;
    let rafId = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointerY = e.clientY;
    };

    const tick = () => {
      const surface = pickScrollSurface(scrollRef, preferViewport);
      const { top, bottom } =
        surface.kind === "element"
          ? { top: surface.rect.top, bottom: surface.rect.bottom }
          : surface.rect;

      const distFromTop = pointerY - top;
      const distFromBottom = bottom - pointerY;

      let delta = 0;
      if (distFromTop < EDGE_PX) {
        const intensity = distFromTop <= 0 ? 1 : 1 - distFromTop / EDGE_PX;
        delta = -MAX_SPEED * intensity * intensity;
      } else if (distFromBottom < EDGE_PX) {
        const intensity = distFromBottom <= 0 ? 1 : 1 - distFromBottom / EDGE_PX;
        delta = MAX_SPEED * intensity * intensity;
      }

      applyScroll(surface, delta);
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [dragging, scrollRef, preferViewport]);
}
