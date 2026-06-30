import { Card } from "@/components/ui";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card title="Sign in to Office Lunch">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
