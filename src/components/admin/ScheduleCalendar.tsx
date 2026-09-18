"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  generateSchedulesFromTemplates,
  openLunchSchedule,
  closeLunchSchedule,
  upsertDaySchedule,
} from "@/lib/actions/schedules";
import { Button, ErrorMessage, Select, SuccessMessage } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { DailyLunchSchedule, Office, Restaurant } from "@/types/database";

type ScheduleRow = DailyLunchSchedule & {
  restaurants: { name: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-green-100 border-green-400 text-green-900",
  draft: "bg-slate-100 border-slate-300 text-slate-700",
  closed: "bg-amber-100 border-amber-400 text-amber-900",
  sent_to_restaurant: "bg-blue-100 border-blue-300 text-blue-900",
  delivered: "bg-slate-50 border-slate-200 text-slate-600",
  cancelled: "bg-red-50 border-red-200 text-red-600",
};

export function ScheduleCalendar({
  offices,
  restaurants,
  schedules,
}: {
  offices: Office[];
  restaurants: Restaurant[];
  schedules: ScheduleRow[];
}) {
  const router = useRouter();
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [editDate, setEditDate] = useState<string | null>(null);
  const [editRestaurantId, setEditRestaurantId] = useState("");
  const [closeConfirmId, setCloseConfirmId] = useState<string | null>(null);

  const weeks = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startDow = start.getDay();
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() - startDow);

    const days: { date: string; label: string; dow: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        dow: d.getDay(),
      });
    }
    return [days.slice(0, 7), days.slice(7, 14)] as const;
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleRow>();
    for (const s of schedules.filter((s) => s.office_id === officeId)) {
      map.set(s.lunch_date, s);
    }
    return map;
  }, [schedules, officeId]);

  function openEditor(dayDate: string, row: ScheduleRow | undefined) {
    setEditDate(dayDate);
    setEditRestaurantId(row?.restaurant_id ?? restaurants[0]?.id ?? "");
    setError(null);
  }

  function runGenerate() {
    startTransition(async () => {
      const result = await generateSchedulesFromTemplates(14);
      if (!result.success) setError(result.error);
      else {
        setSuccess(`Generated ${result.data.created} days from weekly templates`);
        router.refresh();
      }
    });
  }

  function saveDay(lunchDate: string) {
    if (!editRestaurantId) {
      setError("Pick a restaurant");
      return;
    }
    startTransition(async () => {
      const result = await upsertDaySchedule({
        officeId,
        lunchDate,
        restaurantId: editRestaurantId,
      });
      if (!result.success) setError(result.error);
      else {
        setEditDate(null);
        setSuccess("Day saved — click Open when employees should order.");
        router.refresh();
      }
    });
  }

  function toggleOpen(scheduleId: string, open: boolean) {
    startTransition(async () => {
      const result = open ? await openLunchSchedule(scheduleId) : await closeLunchSchedule(scheduleId);
      if (!result.success) setError(result.error);
      else {
        setSuccess(open ? "Ordering opened for this day." : "Day closed — restaurant notified if email is configured.");
        setCloseConfirmId(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      <div className="flex flex-wrap items-end gap-3">
        <Select
          label="Office"
          value={officeId}
          onChange={(e) => setOfficeId(e.target.value)}
          className="min-w-[200px]"
        >
          {offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
        <Button variant="secondary" onClick={runGenerate} loading={isPending}>
          Fill 2 weeks from templates
        </Button>
      </div>

      <p className="text-sm text-slate-600">
        Click anywhere on a day to set the restaurant. Use <strong>Open</strong> when employees should order.
      </p>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-2">
          {week.map((day) => {
            const row = byDate.get(day.date);
            const status = row?.status ?? "empty";
            const tone =
              status === "empty"
                ? "bg-white border-dashed border-slate-300 text-slate-500 hover:border-[var(--geaux-yellow)] hover:bg-[var(--geaux-cream)]"
                : `${STATUS_COLORS[status] ?? STATUS_COLORS.draft} hover:shadow-md`;

            return (
              <div
                key={day.date}
                className={`calendar-day-cell flex min-h-[128px] flex-col rounded-xl border p-2 text-xs transition-all ${tone}`}
              >
                <button
                  type="button"
                  className="flex min-h-[72px] flex-1 flex-col rounded-lg p-1 text-left transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
                  onClick={() => openEditor(day.date, row)}
                >
                  <span className="font-semibold">{day.label}</span>
                  {row ? (
                    <>
                      <span className="mt-1 line-clamp-2 font-medium">{row.restaurants?.name ?? "—"}</span>
                      <span className="mt-1 capitalize opacity-80">{row.status}</span>
                    </>
                  ) : (
                    <span className="mt-2 font-medium text-[var(--geaux-red)]">+ Add lunch</span>
                  )}
                </button>
                {row ? (
                  <div className="mt-1 shrink-0">
                    {row.status !== "open" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="success"
                        className="w-full text-[10px]"
                        disabled={isPending}
                        onClick={() => toggleOpen(row.id, true)}
                      >
                        Open
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="w-full border-amber-500 text-[10px] text-amber-900"
                        disabled={isPending}
                        onClick={() => setCloseConfirmId(row.id)}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}

      <ConfirmDialog
        open={closeConfirmId !== null}
        title="Close this lunch day?"
        message="Employees won't be able to order anymore. If email is configured, the restaurant may receive the order summary."
        confirmLabel="Close day"
        variant="danger"
        loading={isPending}
        onCancel={() => setCloseConfirmId(null)}
        onConfirm={() => closeConfirmId && toggleOpen(closeConfirmId, false)}
      />

      {editDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm animate-fade-in rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-slate-900">Schedule {editDate}</h3>
            <Select
              label="Restaurant"
              className="mt-3"
              value={editRestaurantId}
              onChange={(e) => setEditRestaurantId(e.target.value)}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => setEditDate(null)}>
                Cancel
              </Button>
              <Button loading={isPending} onClick={() => saveDay(editDate)}>
                Save day
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
