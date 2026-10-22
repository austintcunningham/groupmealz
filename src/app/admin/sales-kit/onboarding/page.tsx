import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantPartnerOnboardingChecklist } from "@/components/admin/sales-kit/RestaurantPartnerOnboardingChecklist";
import { RestaurantPartnerPlaybook } from "@/components/admin/sales-kit/RestaurantPartnerPlaybook";
import { RestaurantPartnerPayoutTerms } from "@/components/admin/sales-kit/RestaurantPartnerPayoutTerms";
import { RestaurantSalesTaxNotice } from "@/components/admin/sales-kit/RestaurantSalesTaxNotice";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantOnboardingPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Restaurant onboarding">
      <SalesKitToolbar audience="onboarding" />
      <RestaurantPartnerOnboardingChecklist />

      <div className="onboarding-partner-reference sales-kit-document mx-auto mt-12 max-w-3xl space-y-8 border-t border-slate-200 pt-10 print:mt-0 print:border-0 print:pt-4">
        <div className="print:hidden">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
            Partner reference — print after kickoff
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            These sections are intentionally <strong>not</strong> in the public sales packet. Walk
            through them on the kickoff call or print as a fulfillment guide.
          </p>
        </div>

        <RestaurantPartnerPlaybook />
        <RestaurantPartnerPayoutTerms />
        <RestaurantSalesTaxNotice />
      </div>
    </DashboardShell>
  );
}
