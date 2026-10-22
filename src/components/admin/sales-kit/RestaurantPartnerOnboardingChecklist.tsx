"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import {
  RESTAURANT_ONBOARDING_CHECKLIST,
  type OnboardingChecklistPhase,
} from "@/lib/sales-kit/restaurant-onboarding-checklist";

const STORAGE_KEY = "groupmeals-onboarding-checklist-v1";

function loadChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function RestaurantPartnerOnboardingChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [cateringFirst, setCateringFirst] = useState(false);
  const [partnerLabel, setPartnerLabel] = useState("");

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setChecked({});
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const printChecklistOnly = useCallback(() => {
    document.documentElement.classList.add("print-onboarding-checklist-only");
    window.print();
    window.addEventListener(
      "afterprint",
      () => {
        document.documentElement.classList.remove("print-onboarding-checklist-only");
      },
      { once: true }
    );
  }, []);

  const phases = RESTAURANT_ONBOARDING_CHECKLIST;
  const totalItems = phases.reduce((n, p) => n + p.items.length, 0);
  const doneCount = phases.reduce(
    (n, p) => n + p.items.filter((i) => checked[i.id]).length,
    0
  );

  return (
    <div className="onboarding-checklist space-y-8">
      <div className="print:hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--geaux-red)]">
              Internal — onboarding specialists
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--geaux-charcoal)]">
              Restaurant partner onboarding
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Work through this checklist per partner. Pitch PDFs stay lightweight; use kickoff and
              the partner reference sections below for policy and operations detail.
            </p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <span className="font-semibold text-[var(--geaux-charcoal)]">
              {doneCount}/{totalItems}
            </span>{" "}
            complete
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Partner / store (optional label)</span>
            <input
              type="text"
              value={partnerLabel}
              onChange={(e) => setPartnerLabel(e.target.value)}
              placeholder="e.g. Chick-fil-A Gonzales Hwy 30"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
            <input
              type="checkbox"
              checked={cateringFirst}
              onChange={(e) => setCateringFirst(e.target.checked)}
              className="h-4 w-4 rounded border-amber-300"
            />
            Catering-first path (highlight catering hints)
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => printChecklistOnly()}
            className="rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--geaux-red-dark)]"
          >
            Print checklist
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Reset all checks
          </button>
        </div>
      </div>

      {partnerLabel ? (
        <p className="hidden text-sm font-semibold text-slate-800 print:block">
          Partner: {partnerLabel}
        </p>
      ) : null}

      <div className="space-y-6">
        {phases.map((phase, index) => (
          <PhaseBlock
            key={phase.id}
            phase={phase}
            index={index + 1}
            checked={checked}
            onToggle={toggle}
            cateringFirst={cateringFirst}
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 print:break-inside-avoid">
        <p className="font-semibold text-slate-800">Quick defaults ({BRAND.name})</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Time zone: America/Chicago (Central) for cutoffs and digests</li>
          <li>Ordering window: typically opens 48 hours before cutoff (see platform settings)</li>
          <li>Cutoff &amp; kitchen digest: default 9:30 AM Central on lunch day</li>
          <li>Support / ops: {BRAND.supportEmail}</li>
        </ul>
      </div>
    </div>
  );
}

function PhaseBlock({
  phase,
  index,
  checked,
  onToggle,
  cateringFirst,
}: {
  phase: OnboardingChecklistPhase;
  index: number;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  cateringFirst: boolean;
}) {
  const phaseDone = phase.items.every((i) => checked[i.id]);

  return (
    <section className="onboarding-phase rounded-2xl border border-slate-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none">
      <div className="border-b border-slate-100 bg-[var(--geaux-cream)] px-5 py-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              phaseDone ? "bg-emerald-600 text-white" : "bg-[var(--geaux-red)] text-white"
            }`}
          >
            {index}
          </span>
          <div>
            <h3 className="text-lg font-bold text-[var(--geaux-charcoal)]">{phase.title}</h3>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {phase.subtitle}
            </p>
            {cateringFirst && phase.cateringFirstHint ? (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                {phase.cateringFirstHint}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {phase.items.map((item) => (
          <li key={item.id} className="flex gap-3 px-5 py-4">
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => onToggle(item.id)}
              className="onboarding-check mt-1 h-4 w-4 shrink-0 rounded border-slate-300 print:appearance-auto"
              aria-label={item.task}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium leading-snug ${
                  checked[item.id] ? "text-slate-500 line-through" : "text-slate-900"
                }`}
              >
                {item.task}
              </p>
              {item.notes ? (
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.notes}</p>
              ) : null}
              {cateringFirst && item.cateringFirstHint ? (
                <p className="mt-1 text-xs font-medium text-amber-800">{item.cateringFirstHint}</p>
              ) : null}
              {item.adminHref ? (
                <Link
                  href={item.adminHref}
                  className="print:hidden mt-2 inline-flex text-xs font-semibold text-[var(--geaux-red)] hover:underline"
                >
                  {item.adminLabel ?? "Open in admin"} →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
