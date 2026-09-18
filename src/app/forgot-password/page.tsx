import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell title="Reset your password">
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
