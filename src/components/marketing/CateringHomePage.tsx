import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { MarketingSiteHeader } from "@/components/marketing/MarketingSiteHeader";
import { CateringSearchForm } from "@/components/catering/CateringSearchForm";
import { CateringRestaurantCard } from "@/components/catering/CateringRestaurantCard";
import type { Restaurant } from "@/types/database";

const OCCASIONS = [
  "Office Lunches",
  "Business Meetings",
  "Corporate Events",
  "Birthday Parties",
  "Family Gatherings",
  "Team Celebrations",
] as const;

export function CateringHomePage({
  restaurants,
  signedInHref,
}: {
  restaurants: Restaurant[];
  signedInHref?: string | null;
}) {
  return (
    <div className="min-h-screen">
      <MarketingSiteHeader signedInHref={signedInHref} />

      <section className="relative overflow-hidden border-b border-red-900/10 bg-[var(--geaux-red)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 85% 20%, rgb(253 185 19 / 0.45), transparent 55%), radial-gradient(ellipse 50% 60% at 10% 90%, rgb(0 0 0 / 0.25), transparent 50%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--geaux-yellow)]">
              {BRAND.name}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {BRAND.tagline}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/90">
              Find local restaurants, choose your catering, and get food for your next
              meeting, party, or event.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catering"
                className="rounded-full bg-[var(--geaux-yellow)] px-6 py-3 text-sm font-bold text-[var(--geaux-charcoal)] shadow-md hover:bg-[var(--geaux-yellow-light)]"
              >
                Find Catering
              </Link>
              <Link
                href="/#how-it-works"
                className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                How It Works
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xl sm:p-6">
            <p className="mb-4 text-sm font-bold text-slate-800">Plan your catering order</p>
            <CateringSearchForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14" id="restaurants">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Featured catering</h2>
          <p className="mt-2 text-slate-600">
            Participating restaurants near Baton Rouge. Only real partners appear here.
          </p>
        </div>
        {restaurants.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <CateringRestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
            <p className="font-medium text-slate-800">Catering restaurants coming soon</p>
            <p className="mt-2 text-sm text-slate-600">
              We&apos;re onboarding local partners. For today&apos;s office lunch group orders,{" "}
              <Link href="/order" className="font-semibold text-[var(--geaux-red)] hover:underline">
                start a group order
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <section id="how-it-works" className="border-y border-slate-200/80 bg-white/80 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">How it works</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Three steps from craving to catering.
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { n: "1", t: "Find a Restaurant", d: "Search by location, date, and guest count." },
              { n: "2", t: "Choose Your Catering", d: "Browse platters, boxed lunches, and more." },
              { n: "3", t: "Schedule Your Order", d: "Pick delivery or pickup for your event." },
            ].map((step) => (
              <li key={step.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--geaux-red)] text-lg font-bold text-white">
                  {step.n}
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{step.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Perfect for every occasion</h2>
        <p className="mt-2 text-slate-600">From desk lunches to celebrations.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {OCCASIONS.map((label) => (
            <Link
              key={label}
              href="/catering"
              className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:border-[var(--geaux-red)]/40 hover:text-[var(--geaux-red)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-900 py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Need everyone to choose their own meal?
            </h2>
            <p className="mt-2 text-white/80">
              Start a group order, share a link, and let everyone pick what they want.
            </p>
          </div>
          <Link
            href="/order"
            className="shrink-0 rounded-full bg-[var(--geaux-yellow)] px-6 py-3 text-sm font-bold text-[var(--geaux-charcoal)] hover:bg-[var(--geaux-yellow-light)]"
          >
            Start a Group Order
          </Link>
        </div>
      </section>

      <section id="partners" className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center sm:px-10">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Own a restaurant? Grow your catering business.
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            Partner with {BRAND.name} to reach offices and events in your area.
          </p>
          <Link
            href={`mailto:${BRAND.supportEmail}?subject=Restaurant%20partner%20inquiry`}
            className="mt-6 inline-flex rounded-full bg-[var(--geaux-red)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--geaux-red-dark)]"
          >
            Become a Partner
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/60 py-8 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.tagline}
        </p>
        <p className="mt-2">
          <Link href="/faq" className="hover:text-[var(--geaux-red)]">
            FAQ
          </Link>
          {" · "}
          <Link href="/login" className="hover:text-[var(--geaux-red)]">
            Sign in
          </Link>
          {" · "}
          <Link href="/order" className="hover:text-[var(--geaux-red)]">
            Group ordering
          </Link>
        </p>
      </footer>
    </div>
  );
}
