"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MenuItemPhoto } from "@/components/order/MenuItemPhoto";
import { removeMenuItemImage, uploadMenuItemImage } from "@/lib/actions/menus";
import { Button, ErrorMessage } from "@/components/ui";

export function MenuItemPhotoUpload({
  menuItemId,
  imageUrl,
  itemName,
}: {
  menuItemId: string;
  imageUrl: string | null | undefined;
  itemName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function upload(file: File) {
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadMenuItemImage(menuItemId, fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function remove() {
    if (!imageUrl) return;
    if (!window.confirm(`Remove photo for "${itemName}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await removeMenuItemImage(menuItemId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Item photo</p>
      {error ? <ErrorMessage message={error} /> : null}
      <div className="flex flex-wrap items-start gap-4">
        <div className="space-y-1">
          <MenuItemPhoto imageUrl={imageUrl} itemName={itemName} size="lg" showPlaceholder />
          <p className="text-center text-[10px] text-slate-500 sm:text-left">Customer menu size</p>
        </div>
        <div className="flex min-w-[10rem] flex-1 flex-col gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-[var(--geaux-red)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
            disabled={isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />
          <p className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF · max 5 MB</p>
          <div className="flex flex-wrap gap-2">
            {imageUrl ? (
              <Button type="button" variant="ghost" size="sm" loading={isPending} onClick={remove}>
                Remove photo
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
