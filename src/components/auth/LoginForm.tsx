"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { applyPendingStaffInvitationsForCurrentUser } from "@/lib/actions/users";
import { Button, ErrorMessage, Input } from "@/components/ui";
import Link from "next/link";

function formatAuthError(err: unknown): string {
  if (!err) return "Sign-in failed. Please try again.";
  if (typeof err === "string") {
    const trimmed = err.trim();
    if (!trimmed || trimmed === "{}" || trimmed === "[object Object]") {
      return "Sign-in failed. Please try again.";
    }
    return trimmed;
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  if (typeof err === "object") {
    const record = err as Record<string, unknown>;
    for (const key of ["message", "msg", "error_description", "error"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim() && value.trim() !== "{}") {
        return value.trim();
      }
    }
  }
  return "Sign-in failed. Check your email and password, then try again.";
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(formatAuthError(authError));
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("Sign-in did not create a session. Please try again.");
        setLoading(false);
        return;
      }

      // Never block login on invitation bookkeeping.
      try {
        await applyPendingStaffInvitationsForCurrentUser();
      } catch {
        // ignore — role invites can be applied on the next request
      }

      window.location.assign("/");
    } catch (err) {
      setError(formatAuthError(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <div>
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1 text-right text-sm">
          <Link href="/forgot-password" className="text-[var(--geaux-red)] hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>
      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <Link href="/signup" className="text-red-600 hover:underline">
          Sign up
        </Link>
        {" · "}
        <Link href="/faq" className="text-red-600 hover:underline">
          FAQ
        </Link>
      </p>
    </form>
  );
}
