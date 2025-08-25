// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Monika Dvořáčková",
  description: "AI • ML • Law – blog & projects by Monika Dvořáčková",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return (
    <html lang="en">
      <head>
        {/* ...tvoje JSON-LD + GA4 skripty... */}
      </head>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
