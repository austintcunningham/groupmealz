"use client";

export type MenuJumpSection = { id: string; label: string };

export function MenuCategoryJumpNav({ sections }: { sections: MenuJumpSection[] }) {
  if (sections.length < 2) return null;

  function jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-0 z-20 -mx-1 mb-4 border-b border-slate-200/80 bg-[var(--geaux-cream)]/95 py-2 backdrop-blur-sm"
    >
      <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => jump(s.id)}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-[var(--geaux-red)] hover:text-[var(--geaux-red)]"
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function menuSectionDomId(categoryId: string) {
  return `menu-section-${categoryId}`;
}
