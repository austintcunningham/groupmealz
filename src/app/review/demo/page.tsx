import Link from "next/link";
import { RestaurantReviewForm } from "@/components/reviews/RestaurantReviewForm";
import { Card } from "@/components/ui";
import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";
import type { ReviewOrderContext } from "@/lib/actions/reviews";

const demoContext: ReviewOrderContext = {
  orderId: "00000000-0000-4000-8000-000000000099",
  restaurantName: "Firehouse Subs Gonzales",
  officeName: "Iberville Building (sample)",
  lunchDate: "2026-10-13",
  customerName: "Alex",
  alreadyReviewed: false,
  requiresEmailConfirm: false,
  canReview: true,
  reviewOpensAtLabel: null,
};

export default function ReviewDemoPage() {
  return (
    <div className="min-h-screen bg-[var(--geaux-cream)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="geaux-header-gradient rounded-t-xl px-6 py-5 text-center">
          <div className="flex justify-center">
            <GroupMealsLogo size="md" href="/" surface="light" />
          </div>
          <h1 className="mt-3 text-xl font-semibold text-white">Rate your lunch</h1>
          <p className="mt-1 text-sm text-white/85">Demo — try the full survey (nothing is saved)</p>
        </div>
        <Card className="rounded-t-none">
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            This is the same screen customers see from the review email. Submitting here does not write
            to the database.
          </p>
          <p className="mb-4 text-sm text-slate-600">
            <strong>{demoContext.restaurantName}</strong> · Monday, October 13, 2026
            <br />
            <span className="text-slate-500">{demoContext.officeName}</span>
          </p>
          <RestaurantReviewForm context={demoContext} demoMode />
          <p className="mt-6 text-xs text-slate-500">
            One review per order. Feedback is shared with {BRAND.name} and the restaurant partner.
          </p>
          <Link href="/admin/email-preview?cadence=after-lunch&type=review-invite" className="mt-4 inline-block text-sm text-[var(--geaux-red)] hover:underline">
            ← Back to email preview
          </Link>
        </Card>
      </div>
    </div>
  );
}
