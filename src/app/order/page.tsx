import Link from "next/link";
import { Card } from "@/components/ui";
import { BRAND } from "@/lib/brand";
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
    <div className="flex min-h-screen items-center justify-center bg-[var(--geaux-cream)] p-4">
      <div className="w-full max-w-md">
        <div className="geaux-header-gradient rounded-t-xl px-6 py-5 text-center">
          <h1 className="text-3xl font-black text-[var(--geaux-yellow)]">{BRAND.name}</h1>
          <p className="text-sm text-white/80">Order lunch — no account required</p>
        </div>
        <Card className="rounded-t-none" title="Choose your office">
          {!offices?.length ? (
            <p className="text-sm text-slate-600">No offices are set up for ordering yet.</p>
          ) : offices.length === 1 && offices[0].slug ? (
            <Link
              href={officeOrderPath(offices[0].slug)}
              className="block rounded-lg bg-[var(--geaux-red)] px-4 py-3 text-center font-semibold text-white hover:bg-[var(--geaux-red-dark)]"
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
