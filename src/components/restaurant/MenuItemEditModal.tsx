"use client";

import { Modal } from "@/components/ui/Modal";
import { MenuItemEditForm } from "@/components/restaurant/MenuItemEditForm";
import type { MenuItem, MenuItemIngredient, MenuItemSize } from "@/types/database";

export function MenuItemEditModal({
  item,
  categoryOptions,
  isPending,
  showPlatformFeeHints,
  serviceFeePerEntreeCents,
  itemSizes,
  itemIngredients,
  onSave,
  onDelete,
  onClose,
}: {
  item: MenuItem | null;
  categoryOptions: { id: string; label: string }[];
  isPending: boolean;
  showPlatformFeeHints: boolean;
  serviceFeePerEntreeCents: number;
  itemSizes: MenuItemSize[];
  itemIngredients: MenuItemIngredient[];
  onSave: (itemId: string, formData: FormData) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={Boolean(item)} title={item ? `Edit — ${item.name}` : "Edit item"} onClose={onClose} wide>
      {item ? (
      <MenuItemEditForm
        key={item.id}
        item={item}
        categoryOptions={categoryOptions}
        isPending={isPending}
        onSave={onSave}
        onDelete={(id, name) => {
          onDelete(id, name);
          onClose();
        }}
        showPlatformFeeHints={showPlatformFeeHints}
        serviceFeePerEntreeCents={serviceFeePerEntreeCents}
        itemSizes={itemSizes}
        itemIngredients={itemIngredients}
      />
      ) : null}
    </Modal>
  );
}
