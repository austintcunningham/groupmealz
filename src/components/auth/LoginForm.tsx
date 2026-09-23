"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { applyPendingStaffInvitationsForCurrentUser } from "@/lib/actions/users";
import { Button, ErrorMessage, Input } from "@/components/ui";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    await applyPendingStaffInvitationsForCurrentUser();
    window.location.href = "/";
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
