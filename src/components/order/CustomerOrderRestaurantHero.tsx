export function CustomerOrderRestaurantHero({
  officeLabel,
  restaurantName,
  dateLabel,
  logoUrl,
  bannerUrl,
}: {
  officeLabel: string;
  restaurantName: string;
  dateLabel: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}) {
  return (
    <div className="geaux-hero-restaurant overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {bannerUrl ? (
        <div className="flex h-32 w-full items-center justify-center bg-slate-100 sm:h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt=""
            className="max-h-full max-w-full object-contain object-center"
          />
        </div>
      ) : (
        <div className="h-16 bg-gradient-to-r from-red-50 to-amber-50 sm:h-20" aria-hidden />
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover bg-white"
            />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400"
              aria-hidden
            >
              Logo
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-red-600">{officeLabel}</p>
            <h2 className="text-2xl font-bold text-slate-900">{restaurantName}</h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600">{dateLabel}</p>
      </div>
    </div>
  );
}
