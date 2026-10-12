"use client";

import { Modal } from "@/components/ui/Modal";
import { MenuReorderButtons } from "@/components/menus/MenuReorderButtons";
import { subcategoriesFor, topLevelCategories } from "@/lib/menus/category-tree";
import { Button, Input, Select } from "@/components/ui";
import type { MenuCategory, MenuItem } from "@/types/database";

export function MenuCategoriesModal({
  open,
  categories,
  menuItems,
  isPending,
  onClose,
  onAddCategory,
  onSaveCategoryName,
  onAddSubCategory,
  onRemoveCategory,
  onMoveCategory,
}: {
  open: boolean;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  isPending: boolean;
  onClose: () => void;
  onAddCategory: (formData: FormData) => void;
  onSaveCategoryName: (categoryId: string, formData: FormData) => void;
  onAddSubCategory: (parentId: string, name: string) => void;
  onRemoveCategory: (
    categoryId: string,
    categoryName: string,
    itemCount: number,
    subCount: number
  ) => void;
  onMoveCategory: (categoryId: string, direction: "up" | "down") => void;
}) {
  const tops = topLevelCategories(categories);

  function countItems(categoryId: string, includeSubs: boolean): number {
    let n = menuItems.filter((i) => i.category_id === categoryId).length;
    if (includeSubs) {
      for (const sub of subcategoriesFor(categories, categoryId)) {
        n += menuItems.filter((i) => i.category_id === sub.id).length;
      }
    }
    return n;
  }

  return (
    <Modal open={open} title="Categories" onClose={onClose} wide>
      <p className="mb-4 text-sm text-slate-600">
        Rename or remove categories here. Reorder categories and items on the menu preview with drag
        handles.
      </p>
      <form
        className="mb-6 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          onAddCategory(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <h3 className="text-sm font-semibold text-slate-900">Add category</h3>
        <Input name="category_name" required placeholder="Sandwiches, Bowls, Sides…" />
        <Select name="parent_id" label="Under (optional)" defaultValue="">
          <option value="">Top-level category</option>
          {tops.map((cat) => (
            <option key={cat.id} value={cat.id}>
              Sub-category of {cat.name}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" loading={isPending}>
          Add category
        </Button>
      </form>

      <div className="space-y-4">
        {tops.map((cat, catIndex) => {
          const subs = subcategoriesFor(categories, cat.id);
          const treeCount = countItems(cat.id, true);
          return (
            <div key={cat.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-end gap-2">
                <MenuReorderButtons
                  label={`${cat.name} category`}
                  loading={isPending}
                  disableUp={catIndex === 0}
                  disableDown={catIndex === tops.length - 1}
                  onMoveUp={() => onMoveCategory(cat.id, "up")}
                  onMoveDown={() => onMoveCategory(cat.id, "down")}
                />
                <form
                  className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSaveCategoryName(cat.id, new FormData(e.currentTarget));
                  }}
                >
                  <div className="min-w-[10rem] flex-1">
                    <Input name="name" label="Category name" defaultValue={cat.name} required />
                  </div>
                  <Button type="submit" variant="secondary" size="sm" loading={isPending}>
                    Save
                  </Button>
                </form>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={isPending}
                  onClick={() => onRemoveCategory(cat.id, cat.name, treeCount, subs.length)}
                >
                  Delete
                </Button>
              </div>
              {subs.length ? (
                <ul className="mt-3 space-y-2 border-l-2 border-[var(--geaux-yellow)] pl-3">
                  {subs.map((sub, subIndex) => {
                    const subItems = menuItems.filter((i) => i.category_id === sub.id).length;
                    return (
                      <li key={sub.id} className="rounded-md border border-slate-100 bg-white p-2">
                        <div className="flex flex-wrap items-end gap-2">
                          <MenuReorderButtons
                            label={`${sub.name} sub-category`}
                            loading={isPending}
                            disableUp={subIndex === 0}
                            disableDown={subIndex === subs.length - 1}
                            onMoveUp={() => onMoveCategory(sub.id, "up")}
                            onMoveDown={() => onMoveCategory(sub.id, "down")}
                          />
                          <form
                            className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              onSaveCategoryName(sub.id, new FormData(e.currentTarget));
                            }}
                          >
                            <div className="min-w-[8rem] flex-1">
                              <Input
                                name="name"
                                label="Sub-category"
                                defaultValue={sub.name}
                                required
                              />
                            </div>
                            <Button type="submit" variant="secondary" size="sm" loading={isPending}>
                              Save
                            </Button>
                          </form>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            loading={isPending}
                            onClick={() => onRemoveCategory(sub.id, sub.name, subItems, 0)}
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <form
                className="mt-3 flex flex-wrap items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  onAddSubCategory(cat.id, String(fd.get("sub_name") ?? ""));
                  e.currentTarget.reset();
                }}
              >
                <div className="min-w-[10rem] flex-1">
                  <Input
                    name="sub_name"
                    label={`Add sub-category under ${cat.name}`}
                    placeholder="Hot subs, Cold subs…"
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" loading={isPending}>
                  Add sub
                </Button>
              </form>
            </div>
          );
        })}
        {!tops.length ? (
          <p className="text-sm text-slate-500">No categories yet — add one above.</p>
        ) : null}
      </div>
    </Modal>
  );
}
