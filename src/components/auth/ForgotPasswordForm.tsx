"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { buildAuthCallbackUrl } from "@/lib/auth/callback-url";
import { Button, ErrorMessage, Input, SuccessMessage } from "@/components/ui";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = buildAuthCallbackUrl(
      "/reset-password",
      typeof window !== "undefined" ? window.location.origin : undefined
    );

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <SuccessMessage message="If an account exists for that email, we sent a reset link. Check your inbox and spam folder." />
        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="font-medium text-[var(--geaux-red)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      <p className="text-sm text-slate-600">
        Enter your email and we&apos;ll send a link to choose a new password.
      </p>
      <Input
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        Send reset link
      </Button>
      <p className="text-center text-sm text-slate-600">
        <Link href="/login" className="font-medium text-[var(--geaux-red)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
