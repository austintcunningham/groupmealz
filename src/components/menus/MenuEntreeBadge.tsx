import { Badge } from "@/components/ui";

/** Whether this item counts toward per-entrée service fee (default true in DB). */
export function isMenuItemEntree(countsAsEntree: boolean | undefined): boolean {
  return countsAsEntree !== false;
}

export function MenuEntreeBadge({
  countsAsEntree,
  compact = false,
  /** When true (admin menu tools), mention platform service fee on entrées. */
  showPlatformFeeHints = false,
}: {
  countsAsEntree?: boolean;
  compact?: boolean;
  showPlatformFeeHints?: boolean;
}) {
  if (isMenuItemEntree(countsAsEntree)) {
    return (
      <Badge tone="warning">
        {compact || !showPlatformFeeHints ? "Entrée" : "Entrée · service fee applies"}
      </Badge>
    );
  }
  return (
    <Badge tone="default">
      {compact || !showPlatformFeeHints ? "Not entrée" : "Side / drink · no entrée fee"}
    </Badge>
  );
}
