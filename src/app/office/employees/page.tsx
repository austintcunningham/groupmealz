import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { requireOfficeAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function OfficeEmployeesPage() {
  const profile = await requireOfficeAdmin();
  const supabase = await createClient();

  const { data: officeLinks } = await supabase
    .from("office_users")
    .select("office_id")
    .eq("user_id", profile.id)
    .eq("role", "office_admin");

  const officeIds = officeLinks?.map((l) => l.office_id) ?? [];

  const { data: members } = officeIds.length
    ? await supabase
        .from("office_users")
        .select("*, profiles(full_name, email, role)")
        .in("office_id", officeIds)
    : { data: [] };

  return (
    <DashboardShell role={profile.role} title="Employees">
      <Card>
        {!members?.length ? (
          <EmptyState message="No employees assigned to your office yet. Ask an admin to assign users." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2">Office role</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const p = m.profiles as {
                    full_name: string;
                    email: string;
                    role: string;
                  } | null;
                  return (
                    <tr key={m.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4">{p?.full_name}</td>
                      <td className="py-3 pr-4">{p?.email}</td>
                      <td className="py-3 capitalize">{m.role}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
