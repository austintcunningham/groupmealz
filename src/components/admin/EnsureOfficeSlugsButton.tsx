"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ensureOfficeSlugs } from "@/lib/actions/offices";
import { Button, ErrorMessage, SuccessMessage } from "@/components/ui";

export function EnsureOfficeSlugsButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await ensureOfficeSlugs();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        result.data.updated
          ? `Generated ${result.data.updated} order link slug(s).`
          : "All offices already have order links."
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Button type="button" variant="secondary" loading={isPending} onClick={run}>
        Generate order link slugs
      </Button>
    </div>
  );
}
