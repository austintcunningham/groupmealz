import Link from "next/link";
import { Card } from "@/components/ui";
import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { officeOrderPath } from "@/lib/offices/slug";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function OrderLandingPage() {
  const supabase = createAdminClient();
  const { data: offices } = await supabase
    .from("offices")
    .select("id, name, slug, company_name")
    .eq("active", true)
    .not("slug", "is", null)
    .order("name");

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="geaux-auth-stack w-full max-w-md animate-fade-in">
        <div className="geaux-header-gradient px-6 py-7 text-center">
          <div className="flex justify-center">
            <GroupMealsLogo size="lg" priority href="/" surface="light" />
          </div>
          <p className="mt-3 text-sm text-white/90">Order lunch — no account required</p>
        </div>
        <Card className="geaux-card-panel !rounded-none !shadow-none hover:!shadow-none" title="Choose your office">
          {!offices?.length ? (
            <p className="text-sm text-slate-600">No offices are set up for ordering yet.</p>
          ) : offices.length === 1 && offices[0].slug ? (
            <Link
              href={officeOrderPath(offices[0].slug)}
              className="block rounded-xl bg-[var(--geaux-red)] px-4 py-3.5 text-center font-semibold text-white shadow-[var(--geaux-shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--geaux-red-dark)] hover:shadow-[var(--geaux-shadow-md)]"
            >
              Order at {offices[0].name} →
            </Link>
          ) : (
            <ul className="divide-y divide-slate-100">
              {offices.map((o) =>
                o.slug ? (
                  <li key={o.id}>
                    <Link
                      href={officeOrderPath(o.slug)}
                      className="block py-3 font-medium text-red-600 hover:underline"
                    >
                      {o.name}
                      {o.company_name ? (
                        <span className="block text-xs font-normal text-slate-500">{o.company_name}</span>
                      ) : null}
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          )}
          <p className="mt-4 text-center text-xs text-slate-500">
            <Link href="/login" className="text-red-600 hover:underline">
              Admin or restaurant login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
