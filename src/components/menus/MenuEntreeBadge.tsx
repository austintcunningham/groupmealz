import { Badge } from "@/components/ui";

/** Whether this item counts toward per-entrée service fee (default true in DB). */
export function isMenuItemEntree(countsAsEntree: boolean | undefined): boolean {
  return countsAsEntree !== false;
}

export function MenuEntreeBadge({
  countsAsEntree,
  compact = false,
}: {
  countsAsEntree?: boolean;
  compact?: boolean;
}) {
  if (isMenuItemEntree(countsAsEntree)) {
    return (
      <Badge tone="warning">
        {compact ? "Entrée" : "Entrée · service fee applies"}
      </Badge>
    );
  }
  return (
    <Badge tone="default">
      {compact ? "Not entrée" : "Side / drink · no entrée fee"}
    </Badge>
  );
}
