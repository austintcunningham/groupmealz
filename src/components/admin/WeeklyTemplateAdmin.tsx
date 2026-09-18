"use client";

import { useState, useTransition } from "react";
import { createWeeklyTemplate, generateSchedulesFromTemplates } from "@/lib/actions/schedules";
import { getDayName } from "@/lib/scheduling/window";
import { Button, ErrorMessage, Select, SuccessMessage } from "@/components/ui";
import type { Office, Restaurant } from "@/types/database";

export function WeeklyTemplateAdmin({
  offices,
  restaurants,
  templates,
}: {
  offices: Office[];
  restaurants: Restaurant[];
  templates: { id: string; office_id: string; day_of_week: number; restaurant_id: string; cutoff_time: string; delivery_time: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addTemplate(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createWeeklyTemplate({
        office_id: String(formData.get("office_id")),
        day_of_week: Number(formData.get("day_of_week")),
        restaurant_id: String(formData.get("restaurant_id")),
        cutoff_time: String(formData.get("cutoff_time")),
        delivery_time: String(formData.get("delivery_time")),
      });
      if (!result.success) setError(result.error);
      else {
        setSuccess("Template saved");
        window.location.reload();
      }
    });
  }

  function generate() {
    startTransition(async () => {
      const result = await generateSchedulesFromTemplates(14);
      if (!result.success) setError(result.error);
      else setSuccess(`Generated ${result.data.created} schedules for the next 2 weeks`);
    });
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      <form action={addTemplate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select name="office_id" label="Office" required>
          {offices.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </Select>
        <Select name="day_of_week" label="Day" required>
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>{getDayName(d)}</option>
          ))}
        </Select>
        <Select name="restaurant_id" label="Restaurant" required>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </Select>
        <Select name="cutoff_time" label="Cutoff" defaultValue="11:00:00">
          {["10:00:00", "10:30:00", "11:00:00", "11:30:00"].map((t) => (
            <option key={t} value={t}>{t.slice(0, 5)}</option>
          ))}
        </Select>
        <Select name="delivery_time" label="Delivery" defaultValue="12:00:00">
          {["11:30:00", "12:00:00", "12:30:00", "13:00:00"].map((t) => (
            <option key={t} value={t}>{t.slice(0, 5)}</option>
          ))}
        </Select>
        <div className="flex items-end">
          <Button type="submit" loading={isPending}>Save template</Button>
        </div>
      </form>

      <Button variant="secondary" onClick={generate} loading={isPending}>
        Generate next 2 weeks from templates
      </Button>

      {templates.length > 0 ? (
        <ul className="divide-y rounded-xl border bg-white">
          {templates.map((t) => (
            <li key={t.id} className="flex justify-between px-4 py-3 text-sm">
              <span>{getDayName(t.day_of_week)}</span>
              <span className="text-slate-500">
                {restaurants.find((r) => r.id === t.restaurant_id)?.name} · cutoff {t.cutoff_time.slice(0, 5)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
