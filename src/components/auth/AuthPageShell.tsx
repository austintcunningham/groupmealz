import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";
import { Card } from "@/components/ui";

export function AuthPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--geaux-cream)] p-4">
      <div className="w-full max-w-md">
        <div className="geaux-header-gradient rounded-t-xl px-6 py-6 text-center">
          <div className="flex justify-center">
            <GroupMealsLogo size="lg" priority href="/" />
          </div>
          <p className="mt-3 text-sm text-white/85">{BRAND.tagline}</p>
        </div>
        <Card className="rounded-t-none" title={title}>
          {children}
        </Card>
      </div>
    </div>
  );
}
