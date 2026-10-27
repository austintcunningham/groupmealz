"use client";

import { emailHtmlForInlinePreview } from "@/lib/sales-kit/email-preview-html";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  compact?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(compact ? 520 : 640);
  const inlineHtml = useMemo(() => emailHtmlForInlinePreview(html), [html]);

  const syncFrameHeight = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.documentElement) return;

    const contentHeight = Math.max(
      doc.documentElement.scrollHeight,
      doc.body?.scrollHeight ?? 0
    );
    if (contentHeight > 0) {
      setFrameHeight(contentHeight + 8);
    }
  }, []);

  useEffect(() => {
    syncFrameHeight();
  }, [html, syncFrameHeight]);

  useEffect(() => {
    const onBeforePrint = () => syncFrameHeight();
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, [syncFrameHeight]);

  // Compact samples (confirmation / review) stay on one print unit so caption
  // never orphans above a blank page. Taller digests may flow across pages,
  // but the caption still sticks to the start of the email body.
  return (
    <section
      className={`email-sample-frame rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:overflow-visible ${
        compact ? "sales-kit-print-unit" : "sales-kit-print-flow"
      }`}
    >
      <div className="email-sample-caption border-b border-slate-100 bg-[var(--geaux-cream)] px-5 py-4 print:border-slate-300">
        <h3 className="text-lg font-semibold text-[var(--geaux-charcoal)]">{title}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--geaux-red)]">
          {when}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 print:text-black">{pitch}</p>
      </div>
      <div className="email-sample-body bg-slate-100 p-3 print:bg-white print:p-0">
        <div
          className="email-sample-inline hidden bg-white print:block"
          dangerouslySetInnerHTML={{ __html: inlineHtml }}
        />
        <iframe
          ref={iframeRef}
          title={title}
          srcDoc={html}
          onLoad={syncFrameHeight}
          style={{ height: frameHeight }}
          className="email-sample-iframe w-full border-0 bg-white print:hidden"
          sandbox=""
        />
      </div>
    </section>
  );
}
