"use client";

import Image from "next/image";

export function MenuItemPhoto({
  imageUrl,
  itemName,
  size = "md",
  showPlaceholder = true,
}: {
  imageUrl: string | null | undefined;
  itemName: string;
  size?: "sm" | "md";
  showPlaceholder?: boolean;
}) {
  const dim = size === "sm" ? "h-16 w-16" : "h-[4.75rem] w-[4.75rem] sm:h-20 sm:w-20";

  if (!imageUrl && !showPlaceholder) {
    return null;
  }

  return (
    <div
      className={`relative ${dim} shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-sm`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={itemName}
          fill
          className="object-cover"
          sizes={size === "sm" ? "64px" : "80px"}
          unoptimized
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
          aria-hidden
        >
          <span className="text-lg text-slate-300">🍽</span>
        </div>
      )}
    </div>
  );
}
