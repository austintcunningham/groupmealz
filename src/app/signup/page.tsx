import { Card } from "@/components/ui";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card title="Create your account">
          <SignupForm />
        </Card>
      </div>
    </div>
  );
}
