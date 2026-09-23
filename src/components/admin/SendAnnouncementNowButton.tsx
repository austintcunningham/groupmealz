"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendLunchAnnouncementNow } from "@/lib/actions/announcements";
import { Button, ErrorMessage } from "@/components/ui";
import { useState } from "react";

export function SendAnnouncementNowButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await sendLunchAnnouncementNow(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-2">
      {error ? <ErrorMessage message={error} /> : null}
      <Button type="button" size="sm" variant="secondary" loading={isPending} onClick={send}>
        Send now
      </Button>
    </div>
  );
}
