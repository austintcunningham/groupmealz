import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState, ErrorMessage, SuccessMessage } from "@/components/ui";
import { CreateOfficeForm } from "@/components/admin/CreateOfficeForm";
import { AssignOfficeUserForm } from "@/components/admin/AssignOfficeUserForm";
import { generateOfficeSlugsFormAction } from "@/lib/actions/offices";
import { officeOrderPath } from "@/lib/offices/slug";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OfficeRow = {
  id: string;
  name: string;
  slug: string | null;
};

function normalizeOffices(rows: Record<string, unknown>[] | null): OfficeRow[] {
  if (!rows?.length) return [];
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? "Office"),
    slug: row.slug == null || row.slug === "" ? null : String(row.slug),
  }));
}

export default async function AdminOfficesPage({
  searchParams,
}: {
  searchParams: Promise<{ slugError?: string; slugOk?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase.from("offices").select("id,name,slug").order("name");

  const offices = error ? [] : normalizeOffices(data as Record<string, unknown>[] | null);
  const loadError = error?.message ?? null;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.groupmeals.net").replace(/\/$/, "");
  const officesWithSlugs = offices.filter((o) => o.slug?.trim());
  const needsSlugs = offices.length > 0 && officesWithSlugs.length < offices.length;

  return (
    <DashboardShell role={profile.role} title="Offices">
      {params.slugError ? (
        <div className="mb-4">
          <ErrorMessage message={decodeURIComponent(params.slugError)} />
        </div>
      ) : null}
      {params.slugOk != null ? (
        <div className="mb-4">
          <SuccessMessage
            message={
              params.slugOk === "0"
                ? "All offices already had order-link slugs."
                : `Generated slugs for ${params.slugOk} office(s).`
            }
          />
        </div>
      ) : null}

      {loadError ? (
        <div className="mb-6">
          <ErrorMessage message={`Could not load offices: ${loadError}`} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create office">
          <CreateOfficeForm />
          <AssignOfficeUserForm offices={offices} />
        </Card>
        <Card title="Order links (share with employees)">
          <p className="mb-4 text-sm text-slate-600">
            Employees use this link — no signup. Same flow as Major Menus.
          </p>
          {(needsSlugs || (!officesWithSlugs.length && offices.length > 0)) && !loadError ? (
            <form action={generateOfficeSlugsFormAction} className="mb-4">
              <p className="mb-2 text-sm text-slate-600">
                Some offices need a slug before links work.
              </p>
              <button
                type="submit"
                className="rounded-lg border-2 border-[var(--geaux-yellow)] bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-[var(--geaux-yellow-light)]"
              >
                Generate order link slugs
              </button>
            </form>
          ) : null}
          {!offices.length ? (
            <EmptyState message="No offices yet." />
          ) : !officesWithSlugs.length ? (
            <EmptyState message="Generate slugs above, then links will appear here." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {officesWithSlugs.map((o) => {
                const full = `${appUrl}${officeOrderPath(o.slug!)}`;
                return (
                  <li key={o.id} className="py-4">
                    <p className="font-medium">{o.name}</p>
                    <a
                      href={full}
                      className="mt-1 block break-all text-sm text-[var(--geaux-red)] hover:underline"
                    >
                      {full}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
