"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, ErrorMessage } from "@/components/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <ErrorMessage message={error.message || "Something went wrong loading this admin page."} />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/admin" className="rounded-lg border border-slate-200 px-4 py-2 text-sm">
          Admin home
        </Link>
      </div>
    </div>
  );
}
