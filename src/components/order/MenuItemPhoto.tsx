"use client";

import Image from "next/image";

/** Square for compact spots; landscape for menu rows (subs, plates, etc.). */
const SIZE_CLASS = {
  sm: "h-20 w-20",
  md: "w-40 aspect-[5/3] sm:w-44",
  lg: "w-44 aspect-[5/3] sm:w-56",
} as const;

const SIZE_PX = {
  sm: "80px",
  md: "176px",
  lg: "224px",
} as const;

export function MenuItemPhoto({
  imageUrl,
  itemName,
  size = "md",
  showPlaceholder = true,
}: {
  imageUrl: string | null | undefined;
  itemName: string;
  size?: keyof typeof SIZE_CLASS;
  showPlaceholder?: boolean;
}) {
  const dim = SIZE_CLASS[size];
  const isLandscape = size !== "sm";

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
          className={
            isLandscape
              ? "object-contain object-center p-0.5"
              : "object-cover object-center"
          }
          sizes={SIZE_PX[size]}
          unoptimized
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
          aria-hidden
        >
          <span className={`text-slate-300 ${size === "sm" ? "text-lg" : "text-2xl"}`}>🍽</span>
        </div>
      )}
    </div>
  );
}
