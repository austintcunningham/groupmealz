"use client";

import { signOut } from "@/lib/actions/auth";

export function SignOutForm() {
  return (
    <form action={signOut}>
      <button
        className="rounded-full px-3.5 py-2 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/15 active:scale-95"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
