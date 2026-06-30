"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLunchSchedule, openLunchSchedule, closeLunchSchedule } from "@/lib/actions/schedules";
import { Button, ErrorMessage, SuccessMessage } from "@/components/ui";
import type { Office, Restaurant } from "@/types/database";

export function ScheduleAdmin({
  offices,
  restaurants,
}: {
  offices: Office[];
  restaurants: Restaurant[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function createSchedule(formData: FormData) {
    setError(null);
    const lunchDate = String(formData.get("lunch_date") ?? "");
    const cutoffTime = String(formData.get("cutoff_time") ?? "11:00");
    const deliveryTime = String(formData.get("delivery_time") ?? "12:00");

    const orderCutoffAt = new Date(`${lunchDate}T${cutoffTime}:00`).toISOString();
    const deliveryAt = new Date(`${lunchDate}T${deliveryTime}:00`).toISOString();

    startTransition(async () => {
      const result = await createLunchSchedule({
        office_id: String(formData.get("office_id") ?? ""),
        restaurant_id: String(formData.get("restaurant_id") ?? ""),
        lunch_date: lunchDate,
        order_cutoff_at: orderCutoffAt,
        delivery_at: deliveryAt,
        status: "draft",
      });
      if (!result.success) setError(result.error);
      else window.location.reload();
    });
  }

  function handleOpen(scheduleId: string) {
    startTransition(async () => {
      const result = await openLunchSchedule(scheduleId);
      if (!result.success) setError(result.error);
      else window.location.reload();
    });
  }

  function handleClose(scheduleId: string) {
    startTransition(async () => {
      const result = await closeLunchSchedule(scheduleId);
      if (!result.success) setError(result.error);
      else window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorMessage message={error} /> : null}
      <form action={createSchedule} className="grid gap-3 sm:grid-cols-2">
        <select name="office_id" required className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Select office</option>
          {offices.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select name="restaurant_id" required className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Select restaurant</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <input name="lunch_date" type="date" required className="rounded-lg border px-3 py-2 text-sm" />
        <input name="cutoff_time" type="time" defaultValue="11:00" className="rounded-lg border px-3 py-2 text-sm" />
        <input name="delivery_time" type="time" defaultValue="12:00" className="rounded-lg border px-3 py-2 text-sm" />
        <Button type="submit" loading={isPending}>
          Create schedule
        </Button>
      </form>

      <ScheduleActions onOpen={handleOpen} onClose={handleClose} isPending={isPending} />
    </div>
  );
}

function ScheduleActions({
  onOpen,
  onClose,
  isPending,
}: {
  onOpen: (id: string) => void;
  onClose: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="hidden" id="schedule-actions-placeholder" data-open={String(isPending)}>
      {/* Actions rendered inline in page table */}
    </div>
  );
}

export function ScheduleActionButtons({
  scheduleId,
  status,
}: {
  scheduleId: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      {success ? <span className="text-xs text-green-600">{success}</span> : null}
      <div className="flex gap-2">
        {status === "draft" || status === "closed" ? (
          <Button
            type="button"
            size="sm"
            variant="success"
            loading={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await openLunchSchedule(scheduleId);
                if (!result.success) setError(result.error);
                else {
                  setSuccess("Opened");
                  router.refresh();
                }
              })
            }
          >
            Open
          </Button>
        ) : null}
        {status === "open" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await closeLunchSchedule(scheduleId);
                if (!result.success) setError(result.error);
                else {
                  setSuccess("Closed");
                  router.refresh();
                }
              })
            }
          >
            Close
          </Button>
        ) : null}
      </div>
    </div>
  );
}
