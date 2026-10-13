"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getEmailSetupSummary,
  sendAdminTestEmail,
  sendFulfillmentEmailSamplesToOps,
} from "@/lib/actions/email-diagnostics";
import { sendDailyFulfillmentNow } from "@/lib/actions/fulfillment";
import { Button, ErrorMessage, SuccessMessage } from "@/components/ui";

export function AdminEmailDiagnosticsForm() {
  const [summary, setSummary] = useState<{
    resendConfigured: boolean;
    serviceRoleConfigured: boolean;
    cronSecretConfigured: boolean;
    from: string;
    fromAddress: string;
    replyTo: string;
    mailDomain: string;
    opsDigestRecipients: string[];
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
        `Live fulfillment digests sent for ${schedulesProcessed} schedule(s) with orders today.${
          errors.length ? ` Notes: ${errors.join("; ")}` : ""
        }`
      );
    });
  }

  function sendSamples() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await sendFulfillmentEmailSamplesToOps();
      if (!result.success) {
        setError(result.error);
        return;
      }
      const lines = result.data.sent.map((s) => `${s.label} (${s.id})`).join("; ");
      setSuccess(
        `Sample emails queued to office@groupmeals.net: ${lines}.${
          result.data.failures.length ? ` Issues: ${result.data.failures.join("; ")}` : ""
        } Check that inbox and Resend → Emails.`
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

  const allGreen =
    summary?.resendConfigured &&
    summary?.serviceRoleConfigured &&
    summary?.cronSecretConfigured;

  return (
    <div className="space-y-4 text-sm text-slate-600">
      {summary ? (
        <ul className="space-y-1 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
          <li>
            Resend API key:{" "}
            <strong>{summary.resendConfigured ? "OK on server" : "MISSING — emails cannot send"}</strong>
          </li>
          <li>
            Supabase service role:{" "}
            <strong>{summary.serviceRoleConfigured ? "OK" : "MISSING — cron + admin orders break"}</strong>
          </li>
          <li>
            CRON_SECRET:{" "}
            <strong>{summary.cronSecretConfigured ? "OK" : "MISSING — 9:30 job may be blocked"}</strong>
          </li>
          <li>From: {summary.from}</li>
          <li>Reply-To: {summary.replyTo}</li>
          <li>Ops rollup → {summary.opsDigestRecipients.join(", ")}</li>
          <li>Domain: {summary.mailDomain} (Verified in Resend → Domains)</li>
        </ul>
      ) : (
        <p>Loading email config…</p>
      )}

      {summary && !allGreen ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-slate-800">
          <p className="font-semibold text-amber-950">Fix missing server settings (Vercel)</p>
          <p className="mt-2 text-sm">
            Do this once in production. You are not changing Supabase SQL here — only Vercel env vars.
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
            <li>
              Open{" "}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--geaux-red)] underline"
              >
                vercel.com/dashboard
              </a>{" "}
              and click the <strong>Group Meals</strong> project (your production site).
            </li>
            <li>
              Top menu: <strong>Settings</strong> → left sidebar: <strong>Environment Variables</strong>.
            </li>
            <li>
              For each row below, click <strong>Add New</strong>, paste the name exactly, paste the value,
              check <strong>Production</strong> (and Preview if you test previews), then Save.
              <ul className="mt-2 list-disc space-y-2 pl-5 font-mono text-xs text-slate-700">
                {!summary.resendConfigured ? (
                  <li>
                    <strong>RESEND_API_KEY</strong> — copy from{" "}
                    <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                      resend.com/api-keys
                    </a>{" "}
                    (starts with <code className="rounded bg-white px-1">re_</code>).
                  </li>
                ) : null}
                {!summary.serviceRoleConfigured ? (
                  <li>
                    <strong>SUPABASE_SERVICE_ROLE_KEY</strong> — Supabase → Project Settings → API →{" "}
                    <em>service_role</em> secret (never put this in the browser or git).
                  </li>
                ) : null}
                {!summary.cronSecretConfigured ? (
                  <li>
                    <strong>CRON_SECRET</strong> — any long random string you make up (e.g. 32+ characters).
                    Vercel sends it when hitting cron URLs.
                  </li>
                ) : null}
              </ul>
            </li>
            <li>
              Go to <strong>Deployments</strong> → latest deployment → ⋮ menu → <strong>Redeploy</strong> →
              Redeploy (so the new variables load).
            </li>
            <li>Reload this page — all three lines above should say OK.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-600">
            Optional: <strong>EMAIL_FROM</strong> = <code className="rounded bg-white px-1">orders@groupmeals.net</code>{" "}
            if not already set. Optional: <strong>OPS_DIGEST_EMAILS</strong> = extra comma-separated addresses
            copied on the ops rollup (always includes <strong>office@groupmeals.net</strong>).
          </p>
        </div>
      ) : null}

      {summary && allGreen ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Server email config looks good. Use the buttons below to prove delivery end-to-end.
        </p>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700">
        <p className="font-medium text-slate-900">What sends automatically</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Customer</strong> — order confirmation right after Stripe payment.
          </li>
          <li>
            <strong>Restaurant + office admin + office@groupmeals.net</strong> — every day at{" "}
            <strong>9:30 AM Central</strong> when there are paid orders for that lunch date.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" loading={isPending} onClick={sendSamples}>
          Send all 4 sample emails to office@groupmeals.net
        </Button>
        <Button type="button" variant="secondary" loading={isPending} onClick={sendTest}>
          Send test email to me
        </Button>
        <Button type="button" variant="secondary" loading={isPending} onClick={sendFulfillmentDigest}>
          Send today&apos;s live fulfillment (real orders)
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        After any send, confirm in{" "}
        <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" className="underline">
          Resend → Emails
        </a>{" "}
        (status should be <strong>delivered</strong>, not failed).
      </p>
    </div>
  );
}
