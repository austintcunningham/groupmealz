import { EmptyState } from "@/components/ui";
import type { StaffInvitation } from "@/types/database";

function describeInvite(
  row: StaffInvitation & {
    offices: { name: string } | null;
    restaurants: { name: string } | null;
  }
): string {
  if (row.profile_role === "admin") {
    return "Platform admin";
  }
  if (row.restaurant_id && row.restaurants?.name) {
    return `Restaurant manager · ${row.restaurants.name}`;
  }
  if (row.office_id && row.offices?.name) {
    return `${row.office_user_role === "office_admin" ? "Office admin" : "Employee"} · ${row.offices.name}`;
  }
  return row.profile_role;
}

export function PendingStaffInvitations({
  rows,
}: {
  rows: (StaffInvitation & {
    offices: { name: string } | null;
    restaurants: { name: string } | null;
  })[];
}) {
  if (!rows.length) {
    return (
      <EmptyState message="No pending invites — assignments apply instantly when the person already has an account." />
    );
  }

  return (
    <ul className="divide-y divide-slate-100 text-sm">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
          <div>
            <p className="font-medium text-slate-900">{row.email}</p>
            <p className="text-slate-500">{describeInvite(row)}</p>
          </div>
          <p className="text-xs text-slate-400">
            Waiting for signup · {new Date(row.created_at).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
