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

export function GroupMealsLogo({
  size = "md",
  href = "/",
  className = "",
  priority = false,
}: {
  size?: LogoSize;
  href?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const { width, height } = sizes[size];

  const img = (
    <Image
      src={BRAND.logoPath}
      alt={BRAND.name}
      width={width}
      height={height}
      priority={priority}
      className={`h-auto max-w-full object-contain ${className}`}
    />
  );

  if (href == null) {
    return <span className="inline-flex shrink-0">{img}</span>;
  }

  return (
    <Link href={href} className="inline-flex shrink-0">
      {img}
    </Link>
  );
}
