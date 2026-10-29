"use client";

import { MenuEntreeBadge } from "@/components/menus/MenuEntreeBadge";
import { MenuItemOptionsEditor } from "@/components/menus/MenuItemOptionsEditor";
import { MenuItemPhotoUpload } from "@/components/menus/MenuItemPhotoUpload";
import { effectivePriceCents, isPromoActive } from "@/lib/menus/effective-price";
import { formatCents } from "@/lib/money/format";
import { Button, Input, Select } from "@/components/ui";
import type { MenuItem, MenuItemIngredient, MenuItemSize } from "@/types/database";

export function MenuItemEditForm({
  item,
  categoryOptions,
  isPending,
  onSave,
  onDelete,
  onToggleAvailable,
  showPlatformFeeHints,
  serviceFeePerEntreeCents,
  itemSizes,
  itemIngredients,
  formId,
}: {
  item: MenuItem;
  categoryOptions: { id: string; label: string }[];
  isPending: boolean;
  onSave: (itemId: string, formData: FormData) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onToggleAvailable?: (itemId: string, nextAvailable: boolean) => void;
  showPlatformFeeHints: boolean;
  serviceFeePerEntreeCents: number;
  itemSizes: MenuItemSize[];
  itemIngredients: MenuItemIngredient[];
  formId?: string;
}) {
  const promo = isPromoActive(item);
  const charge = effectivePriceCents(item);

  return (
    <form
      id={formId}
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(item.id, new FormData(e.currentTarget));
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <MenuEntreeBadge
          countsAsEntree={item.counts_as_entree}
          showPlatformFeeHints={showPlatformFeeHints}
        />
        {!item.available ? (
          <span className="text-xs font-medium text-amber-700">Sold out (hidden from customers)</span>
        ) : null}
        {promo ? (
          <span className="text-xs font-medium text-green-700">
            Deal → {formatCents(charge)}
          </span>
        ) : null}
        <span className="ml-auto text-sm text-slate-500">
          Regular {formatCents(item.price_cents)}
        </span>
      </div>
      <Input name="name" label="Name" defaultValue={item.name} required />
      <Input name="description" label="Description" defaultValue={item.description ?? ""} />
      <MenuItemPhotoUpload menuItemId={item.id} imageUrl={item.image_url} itemName={item.name} />
      {categoryOptions.length > 0 ? (
        <Select name="category_id" label="Category" defaultValue={item.category_id ?? ""}>
          {categoryOptions.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </Select>
      ) : null}
      <Input
        name="price"
        label="Regular price (USD)"
        type="number"
        step="0.01"
        min="0"
        defaultValue={(item.price_cents / 100).toFixed(2)}
        required
      />
      <input type="hidden" name="available" value={item.available ? "on" : ""} />
      <div
        className={`rounded-xl border p-3 ${
          item.available
            ? "border-slate-200 bg-slate-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <p className="text-sm font-semibold text-slate-800">
          {item.available ? "Visible to customers" : "Hidden from customers"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Out of an ingredient or dish for the day? Hide it instead of deleting — you can show it again
          anytime.
        </p>
        {onToggleAvailable ? (
          <Button
            type="button"
            variant={item.available ? "secondary" : "success"}
            size="sm"
            className="mt-3"
            loading={isPending}
            onClick={() => onToggleAvailable(item.id, !item.available)}
          >
            {item.available ? "Hide from customers" : "Show on menu again"}
          </Button>
        ) : null}
      </div>
      <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
        <input
          type="checkbox"
          name="counts_as_entree"
          defaultChecked={item.counts_as_entree !== false}
          className="mt-0.5 rounded"
        />
        <span>
          {showPlatformFeeHints ? (
            <>
              <strong>Counts as entrée</strong> — customer pays{" "}
              {formatCents(serviceFeePerEntreeCents)} service fee per quantity. Uncheck for sides,
              drinks, and extras.
            </>
          ) : (
            <>
              <strong>Counts as entrée</strong> — main dishes and combos. Uncheck for sides, drinks,
              and extras.
            </>
          )}
        </span>
      </label>
      <MenuItemOptionsEditor
        menuItemId={item.id}
        initialSizes={itemSizes}
        initialIngredients={itemIngredients}
      />
      <div className="rounded-md border border-dashed border-[var(--geaux-yellow)] bg-amber-50/50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Temporary deal
        </p>
        <Input
          name="promo_label"
          label="Deal label (optional)"
          defaultValue={item.promo_label ?? ""}
          placeholder="Today only, $2 off…"
        />
        <Input
          name="promo_price"
          label="Promo price (USD, leave blank to clear)"
          type="number"
          step="0.01"
          min="0"
          defaultValue={
            item.promo_price_cents != null ? (item.promo_price_cents / 100).toFixed(2) : ""
          }
        />
        <Input
          name="promo_ends_at"
          label="Deal ends (date, optional)"
          type="date"
          defaultValue={item.promo_ends_at ?? ""}
        />
      </div>
      <div className="sticky bottom-0 space-y-2 border-t border-slate-100 bg-white pt-3">
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={isPending}>
            Save item
          </Button>
          {onToggleAvailable ? (
            <Button
              type="button"
              variant={item.available ? "secondary" : "success"}
              loading={isPending}
              onClick={() => onToggleAvailable(item.id, !item.available)}
            >
              {item.available ? "Hide from customers" : "Show on menu again"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={isPending}
            onClick={() => onDelete(item.id, item.name)}
          >
            Delete item
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Prefer <strong>Hide</strong> for temporary sell-outs. Delete permanently removes the item.
        </p>
      </div>
    </form>
  );
}

/** Shared fields for creating a new menu item (used in add modal). */
export function MenuItemCreateFields({
  categoryOptions,
  showPlatformFeeHints,
  serviceFeePerEntreeCents,
}: {
  categoryOptions: { id: string; label: string }[];
  showPlatformFeeHints: boolean;
  serviceFeePerEntreeCents: number;
}) {
  return (
    <>
      <Input name="item_name" label="Name" required />
      <Input name="description" label="Description" />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Photo (optional)</label>
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="text-sm text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-[var(--geaux-red)] file:px-3 file:py-1.5 file:text-sm file:text-white"
        />
        <p className="mt-1 text-xs text-slate-500">You can change the photo anytime under Edit.</p>
      </div>
      <Input name="price" label="Regular price (USD)" required type="number" step="0.01" min="0" />
      <Select name="category_id" label="Category" required={categoryOptions.length > 0}>
        {categoryOptions.length === 0 ? (
          <option value="">Add a category first</option>
        ) : (
          categoryOptions.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))
        )}
      </Select>
      <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
        <input type="checkbox" name="counts_as_entree" defaultChecked className="mt-0.5 rounded" />
        <span>
          {showPlatformFeeHints ? (
            <>
              <strong>Counts as entrée</strong> — {formatCents(serviceFeePerEntreeCents)} service fee
              per quantity
            </>
          ) : (
            <>
              <strong>Counts as entrée</strong> — main dish or combo (uncheck for sides and drinks)
            </>
          )}
        </span>
      </label>
    </>
  );
}
