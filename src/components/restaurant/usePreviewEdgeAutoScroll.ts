"use client";

import { useEffect, type RefObject } from "react";

/** Distance from top/bottom of scroll area where auto-scroll begins (px). */
const EDGE_PX = 100;
/** Max scroll speed per animation frame (px). */
const MAX_SPEED = 28;

function scrollRoot(): HTMLElement {
  return document.scrollingElement ?? document.documentElement;
}

type ScrollSurface =
  | { kind: "element"; el: HTMLElement; top: number; bottom: number }
  | { kind: "document"; top: number; bottom: number };

function pickScrollSurface(
  scrollRef: RefObject<HTMLDivElement | null>,
  useDocumentScroll: boolean
): ScrollSurface {
  if (useDocumentScroll) {
    return { kind: "document", top: 0, bottom: window.innerHeight };
  }
  const el = scrollRef.current;
  if (el && el.scrollHeight > el.clientHeight + 4) {
    const rect = el.getBoundingClientRect();
    return { kind: "element", el, top: rect.top, bottom: rect.bottom };
  }
  return { kind: "document", top: 0, bottom: window.innerHeight };
}

function applyScroll(surface: ScrollSurface, delta: number) {
  if (delta === 0) return;
  if (surface.kind === "element") {
    surface.el.scrollTop += delta;
  } else {
    const root = scrollRoot();
    root.scrollTop += delta;
  }
}

/**
 * Edge auto-scroll while dragging in the menu preview (admin + restaurant menu editor).
 * Menu creator uses document scroll; embedded preview panels scroll their own container.
 */
export function usePreviewEdgeAutoScroll(
  scrollRef: RefObject<HTMLDivElement | null>,
  dragging: boolean,
  /** True for RestaurantMenuEditor (admin / manager menu creator). */
  useDocumentScroll = false
) {
  useEffect(() => {
    if (!dragging) return;

    let pointerY = 0;
    let rafId = 0;

    const setPointerY = (y: number) => {
      pointerY = y;
    };

    const onPointerMove = (e: PointerEvent) => setPointerY(e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setPointerY(t.clientY);
    };

    const tick = () => {
      const surface = pickScrollSurface(scrollRef, useDocumentScroll);
      const distFromTop = pointerY - surface.top;
      const distFromBottom = surface.bottom - pointerY;

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
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(rafId);
    };
  }, [dragging, scrollRef, useDocumentScroll]);
}
