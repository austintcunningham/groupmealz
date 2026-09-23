"use client";

import Link from "next/link";

export default function AdminOfficesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-xl font-bold text-slate-900">Offices page error</h1>
      <p className="mt-2 text-sm text-slate-600">
        {error.message || "Something went wrong loading offices."}
      </p>
      {error.digest ? (
        <p className="mt-1 text-xs text-slate-400">Digest: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
        <Link href="/admin" className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700">
          Admin home
        </Link>
      </div>
    </div>
  );
}
