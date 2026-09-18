import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell title="Choose a new password">
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
