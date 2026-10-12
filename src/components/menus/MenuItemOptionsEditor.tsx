"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@/components/ui";
import { parseDollarsToCents } from "@/lib/money/format";
import type { MenuItemIngredient, MenuItemSize } from "@/types/database";

type SizeDraft = { name: string; price: string; is_default: boolean };
type IngredientDraft = { name: string };

function toSizeDrafts(rows: MenuItemSize[]): SizeDraft[] {
  return rows.map((s) => ({
    name: s.name,
    price: (s.price_cents / 100).toFixed(2),
    is_default: s.is_default,
  }));
}

function toIngredientDrafts(rows: MenuItemIngredient[]): IngredientDraft[] {
  return rows.map((i) => ({ name: i.name }));
}

export function MenuItemOptionsEditor({
  menuItemId,
  initialSizes,
  initialIngredients,
}: {
  menuItemId: string;
  initialSizes: MenuItemSize[];
  initialIngredients: MenuItemIngredient[];
}) {
  const [sizes, setSizes] = useState<SizeDraft[]>(() => toSizeDrafts(initialSizes));
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() =>
    toIngredientDrafts(initialIngredients)
  );

  const payload = useMemo(() => {
    const sizeRows = sizes
      .filter((s) => s.name.trim())
      .map((s, i) => ({
        name: s.name.trim(),
        price_cents: parseDollarsToCents(s.price || "0"),
        is_default: s.is_default,
        display_order: i,
      }));
    if (sizeRows.length && !sizeRows.some((s) => s.is_default)) {
      sizeRows[0]!.is_default = true;
    }
    const ingredientRows = ingredients
      .filter((i) => i.name.trim())
      .map((i) => ({ name: i.name.trim() }));
    return JSON.stringify({ sizes: sizeRows, ingredients: ingredientRows });
  }, [sizes, ingredients]);

  function addSize() {
    setSizes((prev) => [
      ...prev,
      { name: "", price: "", is_default: prev.length === 0 },
    ]);
  }

  function setDefaultSize(index: number) {
    setSizes((prev) => prev.map((s, i) => ({ ...s, is_default: i === index })));
  }

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50/80 p-3">
      <input type="hidden" name="options_payload" value={payload} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Sizes & prices</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Optional. When listed, customers pick a size at order time (each with its own price).
        </p>
        <ul className="mt-2 space-y-2">
          {sizes.map((row, index) => (
            <li key={`${menuItemId}-size-${index}`} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[6rem] flex-1">
                <Input
                  label={index === 0 ? "Size name" : undefined}
                  value={row.name}
                  onChange={(e) =>
                    setSizes((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, name: e.target.value } : s))
                    )
                  }
                  placeholder="Small, Large…"
                />
              </div>
              <div className="w-28">
                <Input
                  label={index === 0 ? "Price ($)" : undefined}
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.price}
                  onChange={(e) =>
                    setSizes((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, price: e.target.value } : s))
                    )
                  }
                />
              </div>
              <label className="mb-2 flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="radio"
                  name={`default_size_${menuItemId}`}
                  checked={row.is_default}
                  onChange={() => setDefaultSize(index)}
                />
                Default
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-1"
                onClick={() =>
                  setSizes((prev) => {
                    const next = prev.filter((_, i) => i !== index);
                    if (next.length && !next.some((s) => s.is_default)) next[0]!.is_default = true;
                    return next;
                  })
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={addSize}>
          + Add size
        </Button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Ingredients</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Customers can opt out of individual ingredients (shown in a compact customize panel).
        </p>
        <ul className="mt-2 space-y-2">
          {ingredients.map((row, index) => (
            <li key={`${menuItemId}-ing-${index}`} className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label={index === 0 ? "Ingredient" : undefined}
                  value={row.name}
                  onChange={(e) =>
                    setIngredients((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, name: e.target.value } : s))
                    )
                  }
                  placeholder="Onions, cheese…"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-1"
                onClick={() => setIngredients((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={() => setIngredients((prev) => [...prev, { name: "" }])}
        >
          + Add ingredient
        </Button>
      </div>
    </div>
  );
}
