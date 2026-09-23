"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  scheduleAndSendLunchAnnouncement,
  scheduleLunchAnnouncement,
} from "@/lib/actions/announcements";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { DailyLunchSchedule, Office } from "@/types/database";

export function LunchAnnouncementForm({
  offices,
  schedules,
}: {
  offices: Office[];
  schedules: (DailyLunchSchedule & {
    offices: { name: string } | null;
    restaurants: { name: string } | null;
  })[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [sendImmediately, setSendImmediately] = useState(false);

  const officeSchedules = schedules.filter((s) => s.office_id === officeId);

  function readPayload(
    formData: FormData
  ): { error: string } | { payload: Parameters<typeof scheduleLunchAnnouncement>[0] } {
    const localSend = String(formData.get("send_at") ?? "");
    const sendAtIso = sendImmediately
      ? new Date().toISOString()
      : new Date(localSend).toISOString();

    if (!sendImmediately && Number.isNaN(new Date(localSend).getTime())) {
      return { error: "Pick a valid send date and time." };
    }

    return {
      payload: {
        officeId: String(formData.get("office_id") ?? officeId),
        scheduleId: String(formData.get("schedule_id") ?? "") || undefined,
        subject: String(formData.get("subject") ?? ""),
        headline: String(formData.get("headline") ?? "") || undefined,
        bodyHtml: String(formData.get("body_html") ?? "") || undefined,
        sendAtIso,
        sendImmediately,
      },
    };
  }

  function scheduleOnly(formData: FormData) {
    setError(null);
    setSuccess(null);
    const parsed = readPayload(formData);
    if ("error" in parsed) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const result = await scheduleLunchAnnouncement(parsed.payload);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess("Scheduled. Use Send now on the right, or wait for cron.");
      router.refresh();
    });
  }

  function scheduleAndSend(formData: FormData) {
    setError(null);
    setSuccess(null);
    const parsed = readPayload(formData);
    if ("error" in parsed) {
      setError(parsed.error);
      return;
    }
    const { sendAtIso: _s, sendImmediately: _i, ...rest } = parsed.payload;
    startTransition(async () => {
      const result = await scheduleAndSendLunchAnnouncement(rest);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        `Resend accepted ${result.data.sent} message(s). From: ${result.data.from}. To: ${result.data.recipients.join(", ") || "(none)"}. Check that inbox and spam; confirm delivery in Resend → Logs.`
      );
      router.refresh();
    });
  }

  return (
    <form className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Select
        name="office_id"
        label="Office"
        value={officeId}
        onChange={(e) => setOfficeId(e.target.value)}
      >
        {offices.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </Select>
      <Select name="schedule_id" label="Restaurant of the Day (recommended)">
        <option value="">No schedule — simple branded office email</option>
        {officeSchedules.map((s) => (
          <option key={s.id} value={s.id}>
            {s.lunch_date} — {s.restaurants?.name ?? "Restaurant"}
          </option>
        ))}
      </Select>
      <p className="text-xs text-slate-600">
        Pick a <strong>schedule</strong> for the full Restaurant of the Day layout (logo, dates,
        order window). Without a schedule, your note still uses the same red/yellow Group Meals
        template as order confirmations.
      </p>
      <Input name="subject" label="Email subject" required placeholder="🍽 Firehouse Subs is lunch tomorrow!" />
      <Input name="headline" label="Headline (optional)" placeholder="Today's Restaurant of the Day: …" />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={sendImmediately}
          onChange={(e) => setSendImmediately(e.target.checked)}
          className="rounded border-slate-300"
        />
        Queue for next cron run (instead of picking a time)
      </label>
      {!sendImmediately ? (
        <Input name="send_at" label="Send at (your local time)" type="datetime-local" required />
      ) : null}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Extra HTML (required if Custom HTML only)
        </label>
        <textarea
          name="body_html"
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="<p>Special: free cookie with every entrée!</p>"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={isPending}
          onClick={(e) => {
            e.preventDefault();
            const form = (e.currentTarget as HTMLButtonElement).form;
            if (form) scheduleAndSend(new FormData(form));
          }}
        >
          Send now
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={isPending}
          onClick={(e) => {
            e.preventDefault();
            const form = (e.currentTarget as HTMLButtonElement).form;
            if (form) scheduleOnly(new FormData(form));
          }}
        >
          Schedule only
        </Button>
      </div>
    </form>
  );
}
