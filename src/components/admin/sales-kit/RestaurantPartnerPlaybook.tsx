import { BRAND } from "@/lib/brand";

/**
 * Start-to-finish fulfillment guide for restaurant partners (sales packet + print PDF).
 * Timings reflect platform defaults (Central time, 48h ordering window, 9:30 AM cutoff & digest).
 */
export function RestaurantPartnerPlaybook() {
  return (
    <section className="sales-kit-section space-y-8">
      <div className="rounded-2xl border-2 border-[var(--geaux-red)] bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--geaux-red)]">
          Operations guide
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--geaux-charcoal)]">
          The full process — start to finish
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          This is the playbook we expect every {BRAND.name} partner to follow. Offices reorder when
          lunch is on time, labeled correctly, and matches what each person ordered. The steps below
          mirror what the platform does automatically — your job is great food, accurate packing, and
          reliable delivery to the published window.
        </p>
        <p className="mt-3 rounded-lg bg-[var(--geaux-cream)] px-3 py-2 text-xs text-slate-600">
          <strong>Time zone:</strong> All cutoffs and digest send times are{" "}
          <strong>America/Chicago (Central)</strong>. Default order cutoff is{" "}
          <strong>9:30 AM</strong> on the lunch date; employees can order up to{" "}
          <strong>48 hours</strong> before cutoff unless your market uses a different setting.
        </p>
      </div>

      <Phase
        number="A"
        title="Before your first lunch day"
        subtitle="One-time setup with a dedicated onboarding specialist"
      >
        <p className="rounded-lg border border-[var(--geaux-yellow)] bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
          A {BRAND.name} <strong>onboarding specialist</strong> walks you through the entire process
          start to finish — menu structure, kitchen workflow, delivery handoff, and payout rhythm.
          Because we are a small business serving local partners, we can tailor a lot of the platform
          to how <em>your</em> kitchen actually runs (cutoff timing, bagging standards, contact
          routing, and more). Tell us what would make office lunch easy for your team; we will
          configure what we can before day one.
        </p>
        <Step n={1} title="Kickoff call with your specialist">
          Align on goals, volume expectations, and who on your team opens the morning digest, labels
          bags, and delivers.
        </Step>
        <Step n={2} title="Kitchen & finance contacts">
          Provide one email for daily kitchen digests (printed or forwarded to the line). Confirm
          payout contact info for weekly settlement summaries.
        </Step>
        <Step n={3} title="Menu in the platform">
          We enter entrées, sizes, combos, and modifiers (e.g. “no tomato”) so customer choices match
          what your POS/kitchen understands — with your specialist adjusting until it reads right for
          your line.
        </Step>
        <Step n={4} title="Branding">
          Logo and banner on the employee order screen — customers should recognize your restaurant
          before they checkout.
        </Step>
        <Step n={5} title="Dry run">
          Your specialist walks through a sample kitchen email (see below) with your team. Agree who
          labels bags and who drives or dispatches delivery before the first live office day.
        </Step>
      </Phase>

      <Phase
        number="B"
        title="Each week — rotation & visibility"
        subtitle="You know when you’re on the calendar"
      >
        <Step n={1} title="Weekly template">
          Offices run a Mon–Fri rotation. When you’re assigned a day, that lunch is yours — not a
          last-minute phone order.
        </Step>
        <Step n={2} title="Optional weekly payout email">
          Friday afternoon you may receive a check-stub style summary of Mon–Fri meals sold through{" "}
          {BRAND.name} — useful for forecasting and accounting.
        </Step>
      </Phase>

      <Phase
        number="C"
        title="When employees order"
        subtitle="Usually opens ~48 hours before cutoff"
      >
        <Step n={1} title="Ordering window opens">
          Employees at the office use their {BRAND.name} link. They pick items, modifiers, and notes;
          pay by card in the app. You do not take payment at the door.
        </Step>
        <Step n={2} title="While the window is open — you hear nothing (by design)">
          {BRAND.name} does <strong>not</strong> send partial counts, live totals, or order updates
          while employees are still ordering. Your kitchen should not prep this office lunch from
          guesses, walk-ins asking “how many so far?”, or yesterday’s volume — wait for the one
          authoritative email after cutoff.
        </Step>
        <Step n={3} title="Cutoff (default 9:30 AM Central on lunch day)">
          Ordering closes and the schedule locks. That morning you receive a single kitchen digest
          (typically at 9:30 AM Central) with the final headcount and every order detail. No add-ons
          after cutoff unless {BRAND.name} ops coordinates an exception (rare).
        </Step>
      </Phase>

      <Phase
        number="D"
        title="Morning of lunch — your kitchen email"
        subtitle="Sent at 9:30 AM Central after cutoff"
      >
        <Step n={1} title="Open the digest immediately">
          Subject line includes office name and lunch date. Print it or display on a kitchen tablet.
          This is your authoritative order list.
        </Step>
        <Step n={2} title="Read the header block">
          Office name, street address, city/ZIP, <strong>office delivery notes</strong> (e.g. front
          desk, badge access), scheduled <strong>delivery time</strong>, and office contact name/phone.
        </Step>
        <Step n={3} title="Work order-by-order">
          Each block lists customer name, items, sizes, modifiers (“No: lettuce, tomato”), special
          instructions, and (on the restaurant copy) paid totals. Build one complete meal per person —
          not a bulk tray unless the menu item is explicitly shared.
        </Step>
        <Step n={4} title="Production checklist">
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Count orders on the sheet vs. bags you pack before leaving.</li>
            <li>Match modifiers exactly — this is the #1 source of bad reviews.</li>
            <li>Keep hot items hot and cold items cold until bagging.</li>
            <li>If an item is 86’d, call {BRAND.supportEmail} immediately — do not substitute silently.</li>
          </ul>
        </Step>
      </Phase>

      <LabelingAndSealingSection />

      <DeliveryExpectationsSection />

      <Phase
        number="E"
        title="After delivery"
        subtitle="Quality loop & repeat business"
      >
        <Step n={1} title="Customers get a review email">
          About 45 minutes after the scheduled delivery window, each diner receives a one-time invite
          to rate that meal. Feedback is tied to the order — not anonymous noise.
        </Step>
        <Step n={2} title="Fix patterns fast">
          Repeated labeling or modifier misses show up in reviews. {BRAND.name} shares trends with
          partners so you can correct before the next rotation day.
        </Step>
        <Step n={3} title="Settlement, commission & sales tax">
          Use the weekly restaurant email for payout estimates. {BRAND.name} withholds{" "}
          <strong>12% commission on food subtotal + tax</strong> before your check total; sales tax
          collected on orders is paid to you with settlement for your remittance (see Payouts in this
          packet).
        </Step>
      </Phase>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
        <p className="font-semibold">If something goes wrong on delivery day</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Late:</strong> Call the office contact on the digest and {BRAND.supportEmail}.
          </li>
          <li>
            <strong>Wrong or missing meal:</strong> Coordinate replacement with ops — offices remember
            how you handled it.
          </li>
          <li>
            <strong>Access issue:</strong> Follow office delivery notes; do not leave unsecured food in
            public areas unless notes say so.
          </li>
        </ul>
      </div>
    </section>
  );
}

function LabelingAndSealingSection() {
  return (
    <div className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-[var(--geaux-charcoal)]">
        Labeling every bag correctly
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Corporate lunch is individual meals. The office admin and each employee must be able to grab
        the right bag in seconds — no opening every container in the lobby.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-[var(--geaux-cream)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)]">
            Required on every label
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              <strong>Customer first & last name</strong> — exactly as on the kitchen email (large,
              legible marker or printed sticker).
            </li>
            <li>
              <strong>Office name</strong> — when you serve multiple buildings in one run.
            </li>
            <li>
              <strong>Restaurant name</strong> — optional but helpful in multi-vendor buildings.
            </li>
            <li>
              <strong>Item short name or “Meal 1 of 1”</strong> — if one bag per person, still label
              the person.
            </li>
          </ul>
        </div>
        <div className="rounded-xl bg-[var(--geaux-cream)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)]">
            When modifiers matter — show them
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              If the order has <strong>special instructions</strong> or <strong>removed
              ingredients</strong>, add a second line on the label or sticker: e.g.{" "}
              <span className="font-mono text-xs">NO TOMATO · EXTRA PICKLE</span>.
            </li>
            <li>
              Allergies and “no X” requests must match the ticket — when in doubt, write it on the
              label even if it’s also on the receipt inside.
            </li>
            <li>
              Do not use only order numbers — employees do not know internal IDs.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 p-4">
        <p className="font-semibold text-slate-800">Label placement</p>
        <p className="mt-2 text-sm text-slate-600">
          Affix the label to the <strong>primary bag handle or flat side</strong>, not under a flap
          where tape covers the name. If using nested bags (hot entrée inside a larger sack), put the
          name on the <strong>outermost</strong> bag the customer receives.
        </p>
      </div>

      <h3 className="mt-8 text-xl font-bold text-[var(--geaux-charcoal)]">
        Sealing & packing standards
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Offices trust that food is safe, tamper-evident, and not spilled in the lobby.
      </p>

      <ul className="mt-4 space-y-3 text-sm text-slate-700">
        <PackRule
          title="Tamper-evident closure"
          body="Staple receipt to bag, use a sticker seal across the knot, or use a branded tape strip on the top fold. Delivery drivers should not re-open bags after the kitchen seals them."
        />
        <PackRule
          title="Separate hot and cold"
          body="Drinks and cold sides in one sealed bag; hot entrées in another if needed — both labeled with the same customer name. Avoid ice melting on hot food."
        />
        <PackRule
          title="Sauces and liquids"
          body="Cap containers tightly; bag sauces upright; double-bag if necessary. A leak ruins more than one order in a car trunk."
        />
        <PackRule
          title="Utensils & napkins"
          body="Include unless the office note says otherwise. Missing forks generate complaints faster than missing ketchup."
        />
        <PackRule
          title="Receipt inside (optional)"
          body="You may tuck a itemized copy inside the bag for the customer; the kitchen email remains the source of truth for payment (already paid in full online)."
        />
        <PackRule
          title="Final QC"
          body="One person counts bags vs. digest line count, spot-checks 3 random labels against tickets, then loads for delivery in stable crates or boxes so bags don’t tip."
        />
      </ul>
    </div>
  );
}

function DeliveryExpectationsSection() {
  return (
    <div className="break-inside-avoid rounded-2xl border-2 border-[var(--geaux-yellow)] bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-[var(--geaux-charcoal)]">Delivery expectations</h3>
      <p className="mt-2 text-sm text-slate-600">
        The kitchen email states a <strong>delivery time</strong> (e.g. 12:00 PM). Treat that as a
        commitment to the office, not a “sometime before 1” estimate.
      </p>

      <div className="mt-6 space-y-4">
        <ExpectRow
          label="Target"
          detail="Arrive at the building within the scheduled window — ideally 5 minutes before the listed time so the office can distribute before lunch breaks end."
        />
        <ExpectRow
          label="Where to go"
          detail="Follow “Office delivery notes” on the digest: front desk, suite number, loading dock, etc. Check in with the named contact when required."
        />
        <ExpectRow
          label="Handoff"
          detail="Deliver the full order together — labeled bags, correct count. Get acknowledgment from the contact when possible (verbal OK: “Got 42 bags”)."
        />
        <ExpectRow
          label="Individually labeled"
          detail="The digest explicitly says to deliver individually labeled orders. Do not dump unlabeled boxes; the admin uses the same email to reconcile names."
        />
        <ExpectRow
          label="Parking & access"
          detail="Plan ahead for secured buildings, loading docks, and front-desk check-in. If access takes extra time, leave the restaurant earlier — lateness affects reviews for the whole office."
        />
        <ExpectRow
          label="Who delivers"
          detail="Your store staff, catering driver, or owner — consistent driver helps offices learn the routine. Share driver cell with ops if the building requires it."
        />
        <ExpectRow
          label="Payment at door"
          detail={`None. Orders are prepaid. Do not ask employees or the admin for payment or tips on behalf of ${BRAND.name} unless you run a separate in-house program.`}
        />
      </div>

      <p className="mt-6 text-sm font-medium text-slate-800">
        Standard of success: every person finds a bag with their name, food matches the ticket, sealed
        and on time — so the office keeps you on rotation and volume grows.
      </p>
    </div>
  );
}

function Phase({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="break-inside-avoid rounded-2xl border border-slate-200 bg-[var(--geaux-cream)]/50 p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--geaux-red)] text-lg font-bold text-white">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{subtitle}</p>
          <div className="mt-4 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, body, children }: { n: number; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-semibold text-slate-800">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[var(--geaux-red)]">
          {n}
        </span>
        {title}
      </p>
      {body ? <p className="mt-2 pl-8 text-sm text-slate-600">{body}</p> : null}
      {children ? <div className="mt-2 pl-8">{children}</div> : null}
    </div>
  );
}

function PackRule({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-lg border border-slate-100 bg-[var(--geaux-cream)] px-4 py-3">
      <strong className="text-slate-800">{title}.</strong> {body}
    </li>
  );
}

function ExpectRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-[var(--geaux-cream)] px-4 py-3 sm:flex-row sm:gap-4">
      <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)] sm:w-28">
        {label}
      </span>
      <span className="text-sm text-slate-700">{detail}</span>
    </div>
  );
}
