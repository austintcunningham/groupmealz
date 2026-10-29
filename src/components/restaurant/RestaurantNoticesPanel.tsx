"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addRestaurantNotice,
  clearRestaurantNotices,
  removeRestaurantNotice,
} from "@/lib/actions/restaurant-notices";
import { Badge, Button, ErrorMessage, Input, SuccessMessage } from "@/components/ui";
import type { RestaurantNotice } from "@/types/database";

const QUICK_ADD = [
  "Out of lettuce",
  "Out of tomatoes",
  "Out of dirty rice",
  "Out of pickles",
  "86 — limited menu today",
] as const;

export function RestaurantNoticesPanel({
  restaurantId,
  restaurantName,
  initialNotices,
}: {
  restaurantId: string;
  restaurantName: string;
  initialNotices: RestaurantNotice[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshAfter(okMessage: string) {
    setSuccess(okMessage);
    setError(null);
    setMessage("");
    router.refresh();
  }

  function onAdd(text: string) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await addRestaurantNotice(restaurantId, text);
      if (!result.success) {
        setError(result.error);
        return;
      }
      refreshAfter("Notice is live on your order pages.");
    });
  }

  function onRemove(id: string) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await removeRestaurantNotice(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      refreshAfter("Notice removed.");
    });
  }

  function onClearAll() {
    if (!confirm("Clear all kitchen notices for customers?")) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await clearRestaurantNotices(restaurantId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      refreshAfter("All notices cleared.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[rgb(253_185_19_/_0.45)] bg-gradient-to-b from-white to-[rgb(255_251_245_/_0.85)] p-5 shadow-[var(--geaux-shadow-sm)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--geaux-red)]">
              Kitchen updates
            </p>
            <h3 className="mt-1 text-lg font-bold text-[var(--geaux-charcoal)]">{restaurantName}</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
              Post short, temporary notes customers see at the top of the order page — before they
              pick items. Remove them as soon as you&apos;re restocked.
            </p>
          </div>
          {initialNotices.length > 0 ? (
            <Badge tone="warning">{initialNotices.length} live</Badge>
          ) : (
            <Badge tone="default">None live</Badge>
          )}
        </div>
      </div>

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--geaux-shadow-sm)]">
        <p className="text-sm font-semibold text-slate-800">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ADD.map((q) => (
            <button
              key={q}
              type="button"
              disabled={isPending}
              onClick={() => onAdd(q)}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950 transition hover:border-amber-300 hover:bg-amber-100 disabled:opacity-50"
            >
              + {q}
            </button>
          ))}
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            onAdd(message);
          }}
        >
          <div className="min-w-0 flex-1">
            <Input
              label="Custom notice"
              placeholder="e.g. Out of spicy mayo"
              value={message}
              maxLength={120}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button type="submit" loading={isPending} disabled={!message.trim()}>
            Post notice
          </Button>
        </form>
        <p className="text-xs text-slate-500">Up to 8 notices · 120 characters each</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-[var(--geaux-shadow-sm)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">Live on order page</p>
          {initialNotices.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={onClearAll}>
              Clear all
            </Button>
          ) : null}
        </div>

        {initialNotices.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
            No kitchen notices right now. Customers won&apos;t see a banner until you post one.
          </p>
        ) : (
          <ul className="space-y-2">
            {initialNotices.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-amber-950">{n.message}</p>
                  <p className="mt-0.5 text-xs text-amber-800/70">
                    Posted{" "}
                    {new Date(n.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending}
                  onClick={() => onRemove(n.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
