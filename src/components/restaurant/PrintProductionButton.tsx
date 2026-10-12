"use client";

import { Button } from "@/components/ui";

export function PrintProductionButton() {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={() => window.print()}>
      Print prep list
    </Button>
  );
}
