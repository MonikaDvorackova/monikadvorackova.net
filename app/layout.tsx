// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import VercelMetrics from "@/components/VercelMetrics";
import RootFooter from "@/components/RootFooter";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://monikadvorackova.net";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Monika Dvořáčková — AI & ML Engineer & Consultant",
    template: "%s | Monika Dvořáčková",
  },
  description:
    "AI/ML engineer & consultant specializing in LLM strategy, RAG audits, MLOps, AI governance, and hands-on training. Helping companies ship production AI.",
  keywords: [
    "AI consultant", "ML engineer", "LLM", "RAG", "MLOps",
    "AI governance", "EU AI Act", "machine learning", "deep learning",
    "NLP", "prompt engineering", "fine-tuning",
  ],
  authors: [{ name: "Monika Dvořáčková", url: SITE_URL }],
  creator: "Monika Dvořáčková",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Monika Dvořáčková",
    title: "Monika Dvořáčková — AI & ML Engineer & Consultant",
    description:
      "AI/ML engineer & consultant specializing in LLM strategy, RAG audits, MLOps, AI governance, and hands-on training.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monika Dvořáčková — AI & ML Engineer & Consultant",
    description:
      "AI/ML engineer & consultant specializing in LLM strategy, RAG audits, MLOps, AI governance, and hands-on training.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full">
        {children}
        <RootFooter />
        <VercelMetrics />
      </body>
    </html>
  );
}
