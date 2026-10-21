"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  /** Shorter default iframe before auto-size (scroll on screen if needed). */
  compact?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(compact ? 520 : 640);

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

  return (
    <section className="email-sample-frame sales-kit-section break-inside-avoid rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:overflow-visible">
      <div className="border-b border-slate-100 bg-[var(--geaux-cream)] px-5 py-4">
        <h3 className="text-lg font-semibold text-[var(--geaux-charcoal)]">{title}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--geaux-red)]">
          {when}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{pitch}</p>
      </div>
      <div className="bg-slate-100 p-3 print:bg-white print:p-0">
        <iframe
          ref={iframeRef}
          title={title}
          srcDoc={html}
          onLoad={syncFrameHeight}
          style={{ height: frameHeight }}
          className="email-sample-iframe w-full border-0 bg-white"
          sandbox=""
        />
      </div>
    </section>
  );
}
