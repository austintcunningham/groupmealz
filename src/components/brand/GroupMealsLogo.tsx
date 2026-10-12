import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

type LogoSize = "sm" | "md" | "lg";

/** Aspect ratio matches /public/brand/group-meals-logo.png (480×118). */
const sizes: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 132, height: 32 },
  md: { width: 180, height: 44 },
  lg: { width: 240, height: 59 },
};

/** `light` = cream chip behind logo on red/dark headers (matches email header). */
const surfaceWrap: Record<"default" | "light", string> = {
  default: "inline-flex shrink-0",
  light:
    "inline-flex shrink-0 rounded-lg bg-white px-3 py-1.5 shadow-md ring-1 ring-black/15",
};

export function GroupMealsLogo({
  size = "md",
  href = "/",
  className = "",
  priority = false,
  surface = "default",
}: {
  size?: LogoSize;
  href?: string | null;
  className?: string;
  priority?: boolean;
  surface?: "default" | "light";
}) {
  const { width, height } = sizes[size];
  const wrapClass = surfaceWrap[surface];

  const img = (
    <Image
      src={BRAND.logoPath}
      alt={BRAND.name}
      width={width}
      height={height}
      priority={priority}
      className={`h-auto max-w-full object-contain ${surface === "light" ? "contrast-[1.07] saturate-[1.12]" : ""} ${className}`}
    />
  );

  if (href == null) {
    return <span className={wrapClass}>{img}</span>;
  }

  return (
    <Link href={href} className={wrapClass}>
      {img}
    </Link>
  );
}
