"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CateringSearchForm({
  compact = false,
  defaults,
}: {
  compact?: boolean;
  defaults?: {
    zip?: string;
    date?: string;
    time?: string;
    guests?: string;
    fulfillment?: string;
  };
}) {
  const router = useRouter();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const defaultDate = defaults?.date || tomorrow.toISOString().slice(0, 10);

  const [zip, setZip] = useState(defaults?.zip ?? "");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaults?.time ?? "12:00");
  const [guests, setGuests] = useState(defaults?.guests ?? "10");
  const [fulfillment, setFulfillment] = useState(
    defaults?.fulfillment === "pickup" ? "pickup" : "delivery"
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (zip.trim()) params.set("zip", zip.trim());
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (guests) params.set("guests", guests);
    params.set("fulfillment", fulfillment);
    router.push(`/catering?${params.toString()}`);
  }

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-[var(--geaux-red)] focus:ring-2 focus:ring-[var(--geaux-red)]/20";

  return (
    <form
      onSubmit={onSubmit}
      className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-3"}`}
    >
      <label className="block text-left">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Address or ZIP
        </span>
        <input
          className={field}
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="70809"
          inputMode="numeric"
          autoComplete="postal-code"
        />
      </label>
      <label className="block text-left">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Event date
        </span>
        <input
          type="date"
          className={field}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <label className="block text-left">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Desired time
        </span>
        <input
          type="time"
          className={field}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </label>
      <label className="block text-left">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Guests
        </span>
        <input
          type="number"
          min={1}
          max={500}
          className={field}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          required
        />
      </label>
      <label className="block text-left">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Fulfillment
        </span>
        <select
          className={field}
          value={fulfillment}
          onChange={(e) => setFulfillment(e.target.value)}
        >
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
        </select>
      </label>
      <div className={`flex items-end ${compact ? "" : "sm:col-span-2 lg:col-span-1"}`}>
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--geaux-red)] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--geaux-red-dark)]"
        >
          Search
        </button>
      </div>
    </form>
  );
}
