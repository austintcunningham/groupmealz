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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="geaux-auth-stack w-full max-w-md animate-fade-in">
        <div className="geaux-header-gradient px-6 py-7 text-center">
          <div className="flex justify-center">
            <GroupMealsLogo size="lg" priority href="/" surface="light" />
          </div>
          <p className="mt-3 text-sm text-white/90">{BRAND.tagline}</p>
        </div>
        <Card className="geaux-card-panel !rounded-none !shadow-none hover:!shadow-none" title={title}>
          {children}
        </Card>
      </div>
    </div>
  );
}
