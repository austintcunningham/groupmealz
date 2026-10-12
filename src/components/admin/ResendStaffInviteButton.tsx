"use client";

import { useState, useTransition } from "react";
import { resendStaffInvitationById } from "@/lib/actions/users";
import { staffInviteSuccessMessage } from "@/lib/staff/invite-messages";
import { Button, ErrorMessage, SuccessMessage } from "@/components/ui";

export function ResendStaffInviteButton({ invitationId }: { invitationId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={isPending}
        onClick={() => {
          setError(null);
          setSuccess(null);
          startTransition(async () => {
            const result = await resendStaffInvitationById(invitationId);
            if (!result.success) {
              setError(result.error);
              return;
            }
            setSuccess(staffInviteSuccessMessage(result.data));
          });
        }}
      >
        Resend email
      </Button>
    </div>
  );
}
