"use client";

import { signOut } from "@/lib/actions/auth";

export function SignOutForm() {
  return (
    <form action={signOut}>
      <button
        className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--geaux-yellow-light)] transition-all hover:bg-white/10 active:scale-95"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
