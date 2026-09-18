import { DashboardShell } from "@/components/DashboardShell";
import { requireAdmin } from "@/lib/auth/guards";
import { sampleOrderConfirmationHtml } from "@/lib/email/order-confirmation-html";

export default async function AdminEmailPreviewPage() {
  const profile = await requireAdmin();
  const html = sampleOrderConfirmationHtml();

  return (
    <DashboardShell role={profile.role} title="Email preview">
      <p className="mb-4 text-sm text-slate-600">
        This is exactly what customers receive after a successful payment (sample $3.50 order). Subject
        line: <strong>Group Meals — order confirmed for [lunch date]</strong>
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        <iframe
          title="Order confirmation email preview"
          srcDoc={html}
          className="h-[900px] w-full border-0 bg-white"
          sandbox=""
        />
      </div>
    </DashboardShell>
  );
}
