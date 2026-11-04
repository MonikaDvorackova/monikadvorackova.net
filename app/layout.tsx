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
    default: "Dvorackova — ML/AI Engineer",
    template: "%s | Dvorackova",
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
    title: "Dvorackova — ML/AI Engineer",
    description:
      "AI/ML engineer & consultant specializing in LLM strategy, RAG audits, MLOps, AI governance, and hands-on training.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dvorackova — ML/AI Engineer",
    description:
      "AI/ML engineer & consultant specializing in LLM strategy, RAG audits, MLOps, AI governance, and hands-on training.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: {
      url: "/favicon-monika-v2.png",
      type: "image/png",
      sizes: "192x192",
    },
    apple: {
      url: "/favicon-monika-v2.png",
      type: "image/png",
      sizes: "192x192",
    },
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": SITE_URL + "/#person",
    name: "Monika Dvořáčková",
    url: SITE_URL,
    jobTitle: "ML/AI Engineer and Researcher",
    knowsAbout: ["Machine learning", "LLM engineering", "AI governance", "EU AI Act"],
    sameAs: ["https://github.com/monikadvorackova", "https://www.linkedin.com/in/monika-dvorackova/"],
  },
  {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": "https://doi.org/10.37819/Jaike.26.0013",
    headline: "Why Auditability Fails in Current Generative AI Systems: A Governance Perspective",
    datePublished: "2026",
    author: { "@id": SITE_URL + "/#person" },
    identifier: "https://doi.org/10.37819/Jaike.26.0013",
    isPartOf: { "@type": "Periodical", name: "JAIKE" },
    url: "https://doi.org/10.37819/Jaike.26.0013",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "AIGov Core",
    codeRepository: "https://github.com/AIGovDev/aigov-core",
    programmingLanguage: "Rust",
    description: "Decision-bound evidence ledger, policy evaluation and deterministic governance replay.",
    author: { "@id": SITE_URL + "/#person" },
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        {children}
        <RootFooter />
        <VercelMetrics />
      </body>
    </html>
  );
}
