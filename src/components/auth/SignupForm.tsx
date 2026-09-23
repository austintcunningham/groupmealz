"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { applyPendingStaffInvitationsForCurrentUser } from "@/lib/actions/users";
import { Button, ErrorMessage, Input } from "@/components/ui";
import Link from "next/link";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "employee" },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await applyPendingStaffInvitationsForCurrentUser();
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-green-700">
          Account created. Check your email if confirmation is required, then sign in. If an admin
          invited you by email, you&apos;ll land in the right dashboard automatically.
        </p>
        <Link href="/login">
          <Button>Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      <Input
        label="Full name"
        type="text"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-red-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
