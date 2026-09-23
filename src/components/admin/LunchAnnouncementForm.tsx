"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { scheduleLunchAnnouncement } from "@/lib/actions/announcements";
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

  function submit(formData: FormData) {
    setError(null);
    setSuccess(null);
    const localSend = String(formData.get("send_at") ?? "");
    const sendAtIso = sendImmediately
      ? new Date().toISOString()
      : new Date(localSend).toISOString();

    if (!sendImmediately && Number.isNaN(new Date(localSend).getTime())) {
      setError("Pick a valid send date and time.");
      return;
    }

    startTransition(async () => {
      const result = await scheduleLunchAnnouncement({
        officeId: String(formData.get("office_id") ?? officeId),
        scheduleId: String(formData.get("schedule_id") ?? "") || undefined,
        subject: String(formData.get("subject") ?? ""),
        headline: String(formData.get("headline") ?? "") || undefined,
        bodyHtml: String(formData.get("body_html") ?? "") || undefined,
        sendAtIso,
        sendImmediately,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        sendImmediately
          ? "Scheduled for immediate send — run cron or use Send now on the list."
          : "Announcement scheduled."
      );
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-4">
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
      <Select name="schedule_id" label="Restaurant of the Day (auto-build email)">
        <option value="">Custom HTML only</option>
        {officeSchedules.map((s) => (
          <option key={s.id} value={s.id}>
            {s.lunch_date} — {s.restaurants?.name ?? "Restaurant"}
          </option>
        ))}
      </Select>
      <Input name="subject" label="Email subject" required placeholder="🍽 Firehouse Subs is lunch tomorrow!" />
      <Input name="headline" label="Headline (optional)" placeholder="Today's Restaurant of the Day: …" />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={sendImmediately}
          onChange={(e) => setSendImmediately(e.target.checked)}
          className="rounded border-slate-300"
        />
        Send as soon as cron runs (or use Send now below)
      </label>
      {!sendImmediately ? (
        <Input name="send_at" label="Send at (your local time)" type="datetime-local" required />
      ) : null}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Extra HTML (optional if schedule selected)
        </label>
        <textarea
          name="body_html"
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="<p>Special: free cookie with every entrée!</p>"
        />
      </div>
      <Button type="submit" loading={isPending}>
        Schedule email
      </Button>
    </form>
  );
}
