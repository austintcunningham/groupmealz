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
        <div className="geaux-header-gradient rounded-t-xl px-6 py-5 text-center">
          <h1 className="text-3xl font-black text-[var(--geaux-yellow)]">{BRAND.name}</h1>
          <p className="text-sm text-white/80">{BRAND.tagline}</p>
        </div>
        <Card className="rounded-t-none" title={title}>
          {children}
        </Card>
      </div>
    </div>
  );
}
