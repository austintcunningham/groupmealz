"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  scheduleAndSendLunchAnnouncement,
  scheduleLunchAnnouncement,
} from "@/lib/actions/announcements";
import { defaultRotdEmailSubject } from "@/lib/email/restaurant-of-the-day";
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
  const [scheduleId, setScheduleId] = useState(officeSchedules[0]?.id ?? "");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const nextSchedules = schedules.filter((s) => s.office_id === officeId);
    const first = nextSchedules[0]?.id ?? "";
    setScheduleId((prev) =>
      nextSchedules.some((s) => s.id === prev) ? prev : first
    );
  }, [officeId, schedules]);

  useEffect(() => {
    const schedule = officeSchedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      setSubject("");
      return;
    }
    setSubject(
      defaultRotdEmailSubject(
        schedule.restaurants?.name ?? "Restaurant",
        schedule.lunch_date
      )
    );
  }, [scheduleId, officeSchedules]);

  function readPayload(
    formData: FormData
  ): { error: string } | { payload: Parameters<typeof scheduleLunchAnnouncement>[0] } {
    const sid = String(formData.get("schedule_id") ?? scheduleId);
    if (!sid) {
      return { error: "Pick an upcoming Restaurant of the Day schedule first." };
    }

    const localSend = String(formData.get("send_at") ?? "");
    const sendAtIso = sendImmediately
      ? new Date().toISOString()
      : new Date(localSend).toISOString();

    if (!sendImmediately && Number.isNaN(new Date(localSend).getTime())) {
      return { error: "Pick a valid send date and time." };
    }

    const subj = String(formData.get("subject") ?? subject).trim();

    return {
      payload: {
        officeId: String(formData.get("office_id") ?? officeId),
        scheduleId: sid,
        subject: subj || undefined,
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
      <Select
        name="schedule_id"
        label="Restaurant of the Day"
        value={scheduleId}
        onChange={(e) => setScheduleId(e.target.value)}
        required
      >
        {officeSchedules.length === 0 ? (
          <option value="">No upcoming schedules for this office</option>
        ) : (
          officeSchedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.lunch_date} — {s.restaurants?.name ?? "Restaurant"}
            </option>
          ))
        )}
      </Select>
      <p className="text-xs text-slate-600">
        Email layout is fixed: Group Meals branding, restaurant logo/banner, order window, and
        order button — same style as order confirmations. You only choose the office, day, and
        send time.
      </p>
      <Input
        name="subject"
        label="Email subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
        placeholder="Auto-filled from restaurant and date"
      />
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
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={isPending}
          disabled={!scheduleId}
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
          disabled={!scheduleId}
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
