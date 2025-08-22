"use client";

export default function TLDR({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <section className="mt-2 mb-6">
      <div className="text-xs tracking-wider text-neutral-500 mb-1">TL;DR</div>
      <p className="italic text-[15px] leading-relaxed text-neutral-900">{text}</p>
    </section>
  );
}
