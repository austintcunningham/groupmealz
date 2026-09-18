import { Card } from "@/components/ui";
import { LoginForm } from "@/components/auth/LoginForm";
import { BRAND } from "@/lib/brand";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--geaux-cream)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="geaux-header-gradient rounded-t-xl px-6 py-5 text-center">
          <h1 className="text-3xl font-black text-[var(--geaux-yellow)]">{BRAND.name}</h1>
          <p className="text-sm text-white/80">{BRAND.tagline}</p>
        </div>
        <Card className="rounded-t-none" title="Sign in">
          <LoginForm />
          <p className="mt-4 text-center text-sm">
            <Link href="/order" className="font-medium text-[var(--geaux-red)] hover:underline">
              Order lunch (no account) →
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
