"use client";

import { Button } from "@/components/ui";

export function MenuReorderButtons({
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  loading,
  label,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
  loading?: boolean;
  label: string;
}) {
  return (
    <div
      className="flex shrink-0 flex-col gap-0.5"
      role="group"
      aria-label={`Reorder ${label}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-0 px-2 py-0.5 text-base leading-none"
        disabled={disableUp || loading}
        onClick={onMoveUp}
        aria-label={`Move ${label} up`}
      >
        ↑
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="min-h-0 px-2 py-0.5 text-base leading-none"
        disabled={disableDown || loading}
        onClick={onMoveDown}
        aria-label={`Move ${label} down`}
      >
        ↓
      </Button>
    </div>
  );
}
