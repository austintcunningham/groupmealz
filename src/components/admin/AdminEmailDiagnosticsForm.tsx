"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getEmailSetupSummary,
  sendAdminTestEmail,
} from "@/lib/actions/email-diagnostics";
import { sendDailyFulfillmentNow } from "@/lib/actions/fulfillment";
import { Button, ErrorMessage, SuccessMessage } from "@/components/ui";

export function AdminEmailDiagnosticsForm() {
  const [summary, setSummary] = useState<{
    resendConfigured: boolean;
    from: string;
    fromAddress: string;
    replyTo: string;
    mailDomain: string;
    resendDashboardUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void getEmailSetupSummary().then((r) => {
      if (r.success) setSummary(r.data);
    });
  }, []);

  function sendFulfillmentDigest() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await sendDailyFulfillmentNow();
      if (!result.success) {
        setError(result.error);
        return;
      }
      const { schedulesProcessed, errors } = result.data;
      setSuccess(
        `Fulfillment digests sent for ${schedulesProcessed} schedule(s).${
          errors.length ? ` Notes: ${errors.join("; ")}` : ""
        }`
      );
    });
  }

  function sendTest() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await sendAdminTestEmail();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        `Test email queued to ${result.data.to}. Resend ID: ${result.data.id}. Check your inbox and Resend → Emails.`
      );
    });
  }

  return (
    <div className="space-y-4 text-sm text-slate-600">
      {summary ? (
        <ul className="space-y-1 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
          <li>
            Resend API key:{" "}
            <strong>{summary.resendConfigured ? "configured" : "MISSING on server"}</strong>
          </li>
          <li>From: {summary.from}</li>
          <li>Reply-To: {summary.replyTo}</li>
          <li>Domain: {summary.mailDomain} (must show Verified in Resend → Domains)</li>
        </ul>
      ) : (
        <p>Loading email config…</p>
      )}

      <p>
        In Resend, open{" "}
        <a
          href="https://resend.com/emails"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--geaux-red)] underline"
        >
          Emails
        </a>{" "}
        (left sidebar → <strong>Emails</strong>). Staff invites are tagged{" "}
        <code className="rounded bg-slate-100 px-1">restaurant-manager-invite</code>. Failed sends
        appear with status <strong>failed</strong> and an error reason.
      </p>

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      <p>
        Daily kitchen sheets go out at <strong>9:30 AM America/Chicago</strong> via cron. Ops rollup
        uses <code className="rounded bg-slate-100 px-1">OPS_DIGEST_EMAILS</code> (comma-separated)
        or all platform admin profiles.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" loading={isPending} onClick={sendTest}>
          Send test email to me
        </Button>
        <Button type="button" variant="secondary" loading={isPending} onClick={sendFulfillmentDigest}>
          Send today&apos;s fulfillment digests now
        </Button>
      </div>
    </div>
  );
}
