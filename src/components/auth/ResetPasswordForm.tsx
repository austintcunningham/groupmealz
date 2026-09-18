"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, ErrorMessage, Input, SuccessMessage } from "@/components/ui";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setDone(true);
    setLoading(false);
  }

  if (ready === null) {
    return <p className="text-sm text-slate-600">Loading…</p>;
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        <ErrorMessage message="This reset link is invalid or expired. Request a new one below." />
        <Link href="/forgot-password">
          <Button className="w-full">Request new reset link</Button>
        </Link>
        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="font-medium text-[var(--geaux-red)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <SuccessMessage message="Your password was updated. Sign in with your new password." />
        <Link href="/login">
          <Button className="w-full">Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      <Input
        label="New password"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm new password"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        Update password
      </Button>
    </form>
  );
}
