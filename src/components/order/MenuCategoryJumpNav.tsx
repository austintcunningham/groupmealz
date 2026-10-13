"use client";

import { useEffect, useRef, useState } from "react";

export type MenuJumpSection = { id: string; label: string };

export function menuSectionDomId(categoryId: string) {
  return `menu-section-${categoryId}`;
}

export function MenuCategoryJumpNav({
  sections,
  searchQuery,
  onSearchChange,
  hideWhenSearching,
}: {
  sections: MenuJumpSection[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  /** Hide category pills while search results are shown */
  hideWhenSearching?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hideWhenSearching || sections.length < 2) return;

    const ids = sections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5] }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sections, hideWhenSearching]);

  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const btn = navRef.current.querySelector(`[data-section="${activeId}"]`);
    if (btn && "scrollIntoView" in btn) {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeId]);

  function jump(id: string) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const trimmed = searchQuery.trim();

  return (
    <div className="sticky top-0 z-30 mb-4 w-full space-y-2 rounded-xl border border-slate-200/80 bg-white py-2 shadow-sm">
      <div className="px-3">
        <div className="relative min-w-0">
          <label htmlFor="menu-search" className="sr-only">
            Search menu
          </label>
          <input
            id="menu-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search menu…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm shadow-sm outline-none ring-[var(--geaux-red)] placeholder:text-slate-400 focus:border-[var(--geaux-red)] focus:ring-2"
            autoComplete="off"
          />
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            ⌕
          </span>
          {trimmed ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {!hideWhenSearching && sections.length >= 2 ? (
        <nav ref={navRef} aria-label="Menu categories" className="px-3">
          <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => {
              const active = activeId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  data-section={s.id}
                  onClick={() => jump(s.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                    active
                      ? "border-[var(--geaux-red)] bg-[var(--geaux-red)] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[var(--geaux-red)] hover:text-[var(--geaux-red)]"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
