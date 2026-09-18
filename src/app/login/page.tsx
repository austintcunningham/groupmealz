import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ErrorMessage } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const authError =
    error === "auth_callback_failed"
      ? "Sign-in link expired or was invalid. Try again or reset your password."
      : null;

  return (
    <AuthPageShell title="Sign in">
      {authError ? <div className="mb-4"><ErrorMessage message={authError} /></div> : null}
      <LoginForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/order" className="font-medium text-[var(--geaux-red)] hover:underline">
          Order lunch (no account) →
        </Link>
      </p>
    </AuthPageShell>
  );
}
