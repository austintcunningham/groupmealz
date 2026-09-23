"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendLunchAnnouncementNow } from "@/lib/actions/announcements";
import { Button, ErrorMessage, SuccessMessage } from "@/components/ui";
import { useState } from "react";

export function SendAnnouncementNowButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function send() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await sendLunchAnnouncementNow(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        `To: ${result.data.recipients.join(", ")} · From: ${result.data.from}. Check spam and Resend → Logs.`
      );
      router.refresh();
    });
  }

  return (
    <div className="mt-2">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Button type="button" size="sm" loading={isPending} onClick={send}>
        Send now
      </Button>
    </div>
  );
}
