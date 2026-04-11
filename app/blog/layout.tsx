// app/blog/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on AI, machine learning, LLMs, RAG, MLOps, EU AI Act compliance, and responsible AI by Monika Dvořáčková.",
  openGraph: {
    type: "website",
    title: "Blog — Monika Dvořáčková",
    description:
      "Articles on AI, machine learning, LLMs, RAG, MLOps, EU AI Act compliance, and responsible AI.",
    siteName: "Monika Dvořáčková",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Monika Dvořáčková",
    description:
      "Articles on AI, machine learning, LLMs, RAG, MLOps, EU AI Act compliance, and responsible AI.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <footer className="border-t border-black/10 bg-[rgba(253,242,233,0.92)] py-3 text-center text-[10px] font-light leading-snug text-neutral-600">
        © 2026 Monika Dvorackova
      </footer>
    </>
  );
}
