"use client";

import { Modal } from "@/components/ui/Modal";
import { MenuItemCreateFields } from "@/components/restaurant/MenuItemEditForm";
import { Button } from "@/components/ui";

export function MenuAddItemModal({
  open,
  categoryOptions,
  showPlatformFeeHints,
  serviceFeePerEntreeCents,
  isPending,
  onSubmit,
  onClose,
}: {
  open: boolean;
  categoryOptions: { id: string; label: string }[];
  showPlatformFeeHints: boolean;
  serviceFeePerEntreeCents: number;
  isPending: boolean;
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title="Add menu item" onClose={onClose} wide>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }}
      >
        <MenuItemCreateFields
          categoryOptions={categoryOptions}
          showPlatformFeeHints={showPlatformFeeHints}
          serviceFeePerEntreeCents={serviceFeePerEntreeCents}
        />
        <Button type="submit" loading={isPending} disabled={!categoryOptions.length}>
          Add item
        </Button>
      </form>
    </Modal>
  );
}
