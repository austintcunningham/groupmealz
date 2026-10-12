"use client";

import { useEffect, useState } from "react";
import { formatCountdownMs, msUntilOrderCutoff } from "@/lib/scheduling/countdown";

export function CutoffCountdown({
  schedule,
}: {
  schedule: {
    status: string;
    order_opens_at: string;
    order_cutoff_at: string;
  };
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    function tick() {
      const ms = msUntilOrderCutoff(schedule);
      setLabel(ms != null ? formatCountdownMs(ms) : null);
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [schedule]);

  if (!label) return null;

  return (
    <p className="mt-2 text-sm font-medium text-green-800">
      Order by cutoff — <span className="tabular-nums">{label}</span>
    </p>
  );
}
