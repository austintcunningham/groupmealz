import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";

/** Customer-facing red header bar with logo + optional subtitle. */
export function GroupMealsPageHeader({
  subtitle,
  compact = false,
}: {
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <header className="geaux-header-gradient text-white shadow-md">
      <div className="geaux-accent-bar" />
      <div
        className={`mx-auto flex max-w-6xl flex-col items-center px-4 text-center ${compact ? "py-3" : "py-5"}`}
      >
        <GroupMealsLogo size={compact ? "md" : "lg"} priority href="/" surface="light" />
        <p className={`mt-2 text-white/85 ${compact ? "text-xs" : "text-sm"}`}>
          {subtitle ?? BRAND.tagline}
        </p>
      </div>
    </header>
  );
}
