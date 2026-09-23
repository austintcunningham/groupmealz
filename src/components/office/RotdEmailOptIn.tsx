"use client";

import { useState, useTransition } from "react";
import { setOfficeRotdEmailOptIn } from "@/lib/actions/announcements";
import { ErrorMessage, SuccessMessage } from "@/components/ui";

export function RotdEmailOptIn({
  officeId,
  initialOptIn,
}: {
  officeId: string;
  initialOptIn: boolean;
}) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save(next: boolean) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await setOfficeRotdEmailOptIn(officeId, next);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOptIn(next);
      setSuccess(next ? "You'll get Restaurant of the Day emails." : "Opted out of lunch emails.");
    });
  }

  return (
    <div className="space-y-3">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <p className="text-sm text-slate-600">
        Get a branded “Restaurant of the Day” email before each scheduled lunch so you can share the
        order link with your team.
      </p>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={optIn}
          disabled={isPending}
          onChange={(e) => save(e.target.checked)}
          className="rounded border-slate-300"
        />
        Email me Restaurant of the Day announcements
      </label>
    </div>
  );
}
