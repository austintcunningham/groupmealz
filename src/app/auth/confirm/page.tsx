"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ErrorMessage } from "@/components/ui";
import Link from "next/link";

/**
 * Handles Supabase email links that return tokens in the URL hash (#access_token=...)
 * instead of ?code= on /auth/callback.
 */
export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken) {
      setError("This sign-in link is missing credentials. Request a new password reset email.");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
        if (type === "recovery") {
          router.replace("/reset-password");
        } else {
          router.replace("/");
        }
      });
  }, [router]);

  return (
    <AuthPageShell title="Confirming…">
      {error ? (
        <div className="space-y-4">
          <ErrorMessage message={error} />
          <p className="text-center text-sm">
            <Link href="/forgot-password" className="font-medium text-[var(--geaux-red)] hover:underline">
              Request a new reset link
            </Link>
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-600">Finishing sign-in…</p>
      )}
    </AuthPageShell>
  );
}
