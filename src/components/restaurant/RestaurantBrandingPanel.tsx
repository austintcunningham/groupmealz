"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  reviewRestaurantBranding,
  uploadRestaurantBrandingImage,
} from "@/lib/actions/restaurants";
import { brandingNeedsReview, brandingPreviewAssets } from "@/lib/restaurant/branding-display";
import { CustomerOrderBrandingPreview } from "@/components/restaurant/CustomerOrderBrandingPreview";
import { Badge, Button, ErrorMessage, SuccessMessage } from "@/components/ui";
import type { Restaurant } from "@/types/database";

function BrandingUpload({
  label,
  hint,
  currentUrl,
  restaurantId,
  kind,
  disabled,
}: {
  label: string;
  hint: string;
  currentUrl: string | null | undefined;
  restaurantId: string;
  kind: "logo" | "banner";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onFile(file: File) {
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadRestaurantBrandingImage(restaurantId, kind, fd);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="text-xs text-slate-500">{hint}</p>
      {error ? <ErrorMessage message={error} /> : null}
      <div className="flex flex-wrap items-start gap-3">
        {currentUrl ? (
          <div
            className={`relative overflow-hidden rounded-lg border border-slate-200 bg-white ${
              kind === "logo" ? "h-20 w-20" : "h-20 w-40"
            }`}
          >
            <Image src={currentUrl} alt="" fill className="object-cover" sizes="160px" unoptimized />
          </div>
        ) : (
          <div className="flex h-20 w-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400">
            No {kind} yet
          </div>
        )}
        <div className="flex min-w-[12rem] flex-col gap-1">
          <span className="text-sm font-medium text-slate-800">Choose file to upload</span>
          <span className="text-xs text-slate-500">JPEG, PNG, WebP, or GIF — not a URL.</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={disabled || isPending}
          className="max-w-full text-sm text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-[var(--geaux-red)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        </div>
      </div>
    </div>
  );
}

export function RestaurantBrandingPanel({
  restaurant,
  isAdmin,
}: {
  restaurant: Restaurant;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const status = restaurant.branding_status ?? "approved";
  const preview = brandingPreviewAssets(restaurant);
  const pendingReview = brandingNeedsReview(restaurant);

  const managerPendingUrls = {
    logo: restaurant.pending_logo_url,
    banner: restaurant.pending_banner_url,
  };

  function review(decision: "approved" | "rejected") {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await reviewRestaurantBranding(restaurant.id, decision);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(decision === "approved" ? "Branding approved — now live for customers." : "Branding rejected.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Status:</span>
          <Badge
            tone={
              status === "approved" ? "success" : status === "pending" ? "warning" : "default"
            }
          >
            {status}
          </Badge>
          {pendingReview && status !== "approved" ? (
            <span className="text-xs text-amber-800">Awaiting admin review</span>
          ) : null}
        </div>

        <p className="text-sm text-slate-600">
          Upload image <strong>files</strong> for a square <strong>logo</strong> and a wide{" "}
          <strong>banner</strong> (hero). Same controls for restaurant managers and admins — no URL
          fields.
          {isAdmin ? (
            <>
              {" "}
              Your uploads go live immediately; manager uploads stay <strong>pending</strong> until you
              approve on <strong>Branding review</strong>.
            </>
          ) : (
            <> After you upload, an admin approves before it appears on customer order pages.</>
          )}
        </p>

        <BrandingUpload
          label="Logo"
          hint="Shown beside the restaurant name — square works best (~500×500 or larger)."
          currentUrl={isAdmin ? preview.logoUrl : managerPendingUrls.logo ?? preview.logoUrl}
          restaurantId={restaurant.id}
          kind="logo"
        />
        <BrandingUpload
          label="Banner / hero"
          hint="Wide photo across the top of the order page (~1200×400 or similar)."
          currentUrl={isAdmin ? preview.bannerUrl : managerPendingUrls.banner ?? preview.bannerUrl}
          restaurantId={restaurant.id}
          kind="banner"
        />

        {error ? <ErrorMessage message={error} /> : null}
        {success ? <SuccessMessage message={success} /> : null}

        {isAdmin && pendingReview ? (
          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <Button type="button" loading={isPending} onClick={() => review("approved")}>
              Approve for customers
            </Button>
            <Button type="button" variant="secondary" loading={isPending} onClick={() => review("rejected")}>
              Deny
            </Button>
          </div>
        ) : null}

        {!isAdmin && status === "rejected" ? (
          <p className="text-sm text-amber-900">
            Your last submission was not approved. Upload updated images and we&apos;ll review again.
          </p>
        ) : null}
      </div>

      <CustomerOrderBrandingPreview
        restaurantName={restaurant.name}
        logoUrl={preview.logoUrl}
        bannerUrl={preview.bannerUrl}
        caption={
          isAdmin
            ? pendingReview
              ? "Preview uses pending uploads (what customers will see if you approve)."
              : "Preview uses currently approved branding."
            : "This is how your restaurant header will look on the customer order page after approval."
        }
      />
    </div>
  );
}
