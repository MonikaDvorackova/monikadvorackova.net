// app/blog/layout.tsx
import type { Metadata } from "next";
import BlogScrollLock from "@/components/BlogScrollLock";

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
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc]">
      <BlogScrollLock />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <footer className="shrink-0 border-t border-black/10 bg-[rgba(253,242,233,0.92)] py-3 text-center text-[10px] font-light leading-snug text-neutral-600">
        © 2026 Monika Dvorackova
      </footer>
    </div>
  );
}
