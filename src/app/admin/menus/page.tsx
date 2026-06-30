import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
import { MenuAdminForms } from "@/components/admin/MenuAdminForms";
import { MenuPreview } from "@/components/admin/MenuPreview";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMenusPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: restaurants }, { data: categories }, { data: menuItems }] =
    await Promise.all([
      supabase.from("restaurants").select("*").order("name"),
      supabase.from("menu_categories").select("*").order("display_order"),
      supabase.from("menu_items").select("*").order("display_order"),
    ]);

  return (
    <DashboardShell role={profile.role} title="Menus">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Build menu">
          <MenuAdminForms
            restaurants={restaurants ?? []}
            categories={categories ?? []}
            menuItems={menuItems ?? []}
          />
        </Card>
        <Card title="Menu preview">
          <MenuPreview
            restaurants={restaurants ?? []}
            categories={categories ?? []}
            menuItems={menuItems ?? []}
          />
        </Card>
      </div>
    </DashboardShell>
  );
}
