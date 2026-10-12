"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { usePreviewEdgeAutoScroll } from "@/components/restaurant/usePreviewEdgeAutoScroll";
import { useRouter } from "next/navigation";
import { CustomerMenuItemDisplay } from "@/components/order/CustomerOrderMenu";
import { buildCartLineKey } from "@/lib/menus/item-options";
import {
  subcategoriesFor,
  topLevelCategories,
} from "@/lib/menus/category-tree";
import { reorderMenuCategories, reorderMenuItems } from "@/lib/actions/menus";
import { mergeVisibleReorder, reorderIdsInList, sortMenuItems } from "@/lib/menus/sort";
import type {
  MenuCategory,
  MenuItem,
  MenuItemIngredient,
  MenuItemSize,
} from "@/types/database";

type DragKind = "top-cat" | "sub-cat" | "item";

function toDragId(kind: DragKind, id: string) {
  return `${kind}:${id}`;
}

function parseDragId(raw: string): { kind: DragKind; id: string } | null {
  const idx = raw.indexOf(":");
  if (idx === -1) return null;
  const kind = raw.slice(0, idx) as DragKind;
  if (kind !== "top-cat" && kind !== "sub-cat" && kind !== "item") return null;
  return { kind, id: raw.slice(idx + 1) };
}

function SortableRow({
  id,
  label,
  children,
  className = "",
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`${className} ${isDragging ? "menu-dragging" : ""}`}
    >
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          className={`menu-drag-grip ${isDragging ? "menu-drag-grip-active" : ""}`}
          aria-label={`Drag to reorder ${label}`}
          {...attributes}
          {...listeners}
        >
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
          <span className="block h-0.5 w-4 rounded-full bg-current" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function DraggableCustomerMenuPreview({
  allCategories,
  allMenuItems,
  visibleCategories,
  visibleItems,
  sizesByMenuItemId = {},
  ingredientsByMenuItemId = {},
}: {
  allCategories: MenuCategory[];
  allMenuItems: MenuItem[];
  visibleCategories: MenuCategory[];
  visibleItems: MenuItem[];
  sizesByMenuItemId?: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId?: Record<string, MenuItemIngredient[]>;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  usePreviewEdgeAutoScroll(scrollRef, activeDragId != null);

  const promoDate = new Date().toISOString().slice(0, 10);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of sortMenuItems(visibleItems)) {
      const catId = item.category_id ?? "uncategorized";
      const list = map.get(catId) ?? [];
      list.push(item);
      map.set(catId, list);
    }
    return map;
  }, [visibleItems]);

  const tops = topLevelCategories(visibleCategories);
  const orphanSubs = visibleCategories.filter(
    (c) => c.parent_id && !visibleCategories.some((p) => p.id === c.parent_id)
  );

  function siblingsCategories(parentId: string | null) {
    return allCategories.filter((c) => (c.parent_id ?? null) === parentId);
  }

  function siblingsItems(categoryId: string | null) {
    return allMenuItems.filter((i) => (i.category_id ?? null) === categoryId);
  }

  function visibleItemIdsForCategory(categoryId: string | null): string[] {
    const key = categoryId ?? "uncategorized";
    return (itemsByCategory.get(key) ?? []).map((i) => i.id);
  }

  function visibleSubIdsForParent(parentId: string): string[] {
    return subcategoriesFor(visibleCategories, parentId)
      .filter((sub) => (itemsByCategory.get(sub.id) ?? []).length > 0)
      .map((c) => c.id);
  }

  function persistReorder(kind: DragKind, visibleIds: string[], newVisibleOrder: string[]) {
    startTransition(async () => {
      setStatus(null);
      try {
        if (kind === "item") {
          const sample = allMenuItems.find((i) => i.id === visibleIds[0]);
          const categoryId = sample?.category_id ?? null;
          const merged = mergeVisibleReorder(
            siblingsItems(categoryId),
            visibleIds,
            newVisibleOrder
          );
          const result = await reorderMenuItems(merged);
          if (!result.success) {
            setStatus(result.error);
            return;
          }
        } else {
          const sample = allCategories.find((c) => c.id === visibleIds[0]);
          const parentId = kind === "sub-cat" ? (sample?.parent_id ?? null) : null;
          const merged = mergeVisibleReorder(
            siblingsCategories(parentId),
            visibleIds,
            newVisibleOrder
          );
          const result = await reorderMenuCategories(merged);
          if (!result.success) {
            setStatus(result.error);
            return;
          }
        }
        setStatus("Order saved");
        router.refresh();
      } catch {
        setStatus("Could not save order");
      }
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
    setStatus(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeParsed = parseDragId(String(active.id));
    const overParsed = parseDragId(String(over.id));
    if (!activeParsed || !overParsed || activeParsed.kind !== overParsed.kind) return;

    const kind = activeParsed.kind;
    let visibleIds: string[] = [];

    if (kind === "top-cat") {
      visibleIds = tops.map((c) => c.id);
    } else if (kind === "sub-cat") {
      const parentId = allCategories.find((c) => c.id === activeParsed.id)?.parent_id;
      if (!parentId) return;
      visibleIds = visibleSubIdsForParent(parentId);
    } else {
      const item = allMenuItems.find((i) => i.id === activeParsed.id);
      visibleIds = visibleItemIdsForCategory(item?.category_id ?? null);
    }

    const next = reorderIdsInList(visibleIds, activeParsed.id, overParsed.id);
    if (!next) return;
    persistReorder(kind, visibleIds, next);
  }

  function renderItemList(items: MenuItem[]) {
    if (!items.length) return null;
    const sortableIds = items.map((i) => toDragId("item", i.id));
    return (
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {items.map((item) => (
            <SortableRow key={item.id} id={toDragId("item", item.id)} label={item.name}>
              <CustomerMenuItemDisplay
                item={item}
                lunchDate={promoDate}
                sizes={sizesByMenuItemId[item.id] ?? []}
                ingredients={ingredientsByMenuItemId[item.id] ?? []}
                interactive={false}
                showItemOptions
                cart={{}}
                simpleLineKey={buildCartLineKey(item.id, null, [])}
                simpleQty={0}
              />
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    );
  }

  const topSortableIds = tops.map((c) => toDragId("top-cat", c.id));

  const overlayLabel = useMemo(() => {
    if (!activeDragId) return null;
    const parsed = parseDragId(activeDragId);
    if (!parsed) return null;
    if (parsed.kind === "item") {
      return visibleItems.find((i) => i.id === parsed.id)?.name ?? "Item";
    }
    return visibleCategories.find((c) => c.id === parsed.id)?.name ?? "Category";
  }, [activeDragId, visibleCategories, visibleItems]);

  if (visibleItems.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No available items yet — add categories and mark items as Available.
      </p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-y-contain rounded-lg border border-slate-200 bg-white p-3"
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        autoScroll={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`space-y-6 ${isPending ? "pointer-events-none opacity-75" : ""}`}>
        {status ? (
          <p
            className={`animate-fade-in text-xs font-medium ${status.includes("saved") ? "text-green-700" : "text-red-600"}`}
          >
            {status}
          </p>
        ) : null}

        <SortableContext items={topSortableIds} strategy={verticalListSortingStrategy}>
          {tops.map((top) => {
            const subs = subcategoriesFor(visibleCategories, top.id);
            const topItems = itemsByCategory.get(top.id) ?? [];
            const subBlocks = subs
              .map((sub) => ({ sub, items: itemsByCategory.get(sub.id) ?? [] }))
              .filter((b) => b.items.length > 0);

            if (!topItems.length && !subBlocks.length) return null;

            const subSortableIds = subBlocks.map(({ sub }) => toDragId("sub-cat", sub.id));

            return (
              <div
                key={top.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <SortableRow id={toDragId("top-cat", top.id)} label={top.name} className="border-b border-slate-100 bg-slate-50/50 px-3 py-2">
                  <h2 className="py-1 text-lg font-semibold text-slate-900">{top.name}</h2>
                </SortableRow>
                <div className="space-y-5 px-4 py-3">
                  {subBlocks.length > 0 ? (
                    <SortableContext items={subSortableIds} strategy={verticalListSortingStrategy}>
                      {subBlocks.map(({ sub, items }) => (
                        <div
                          key={sub.id}
                          className="overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50/80"
                        >
                          <SortableRow
                            id={toDragId("sub-cat", sub.id)}
                            label={sub.name}
                            className="border-b border-slate-100 px-2 py-1"
                          >
                            <h3 className="py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {sub.name}
                            </h3>
                          </SortableRow>
                          <div className="px-2">{renderItemList(items)}</div>
                        </div>
                      ))}
                    </SortableContext>
                  ) : null}
                  {topItems.length > 0 ? (
                    <div className={subBlocks.length ? "border-t border-slate-100 pt-3" : undefined}>
                      {subBlocks.length > 0 ? (
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Other
                        </h3>
                      ) : null}
                      {renderItemList(topItems)}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </SortableContext>

        {orphanSubs.map((sub) => {
          const items = itemsByCategory.get(sub.id) ?? [];
          if (!items.length) return null;
          return (
            <div key={sub.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-lg font-semibold text-slate-900">{sub.name}</h2>
              </div>
              <div className="px-4 py-3">{renderItemList(items)}</div>
            </div>
          );
        })}

        {(itemsByCategory.get("uncategorized") ?? []).length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
            </div>
            <div className="px-4 py-3">
              {renderItemList(itemsByCategory.get("uncategorized") ?? [])}
            </div>
          </div>
        ) : null}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {activeDragId && overlayLabel ? (
          <div className="menu-drag-overlay">
            <p className="text-sm font-semibold text-slate-900">{overlayLabel}</p>
            <p className="text-xs text-slate-500">Release to set order</p>
          </div>
        ) : null}
      </DragOverlay>
      </DndContext>
    </div>
  );
}
