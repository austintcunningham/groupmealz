export function EmailSampleFrame({
  title,
  when,
  pitch,
  html,
  compact,
}: {
  title: string;
  when: string;
  pitch: string;
  html: string;
  /** Shorter iframe for print-friendly packets */
  compact?: boolean;
}) {
  return (
    <section className="sales-kit-section break-inside-avoid rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-[var(--geaux-cream)] px-5 py-4">
        <h3 className="text-lg font-semibold text-[var(--geaux-charcoal)]">{title}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--geaux-red)]">
          {when}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{pitch}</p>
      </div>
      <div className="bg-slate-100 p-3 print:p-0 print:bg-white">
        <iframe
          title={title}
          srcDoc={html}
          className={`w-full border-0 bg-white print:h-[480px] ${
            compact ? "h-[520px]" : "h-[640px]"
          }`}
          sandbox=""
        />
      </div>
    </section>
  );
}
