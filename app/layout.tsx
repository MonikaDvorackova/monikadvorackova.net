// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Monika Dvořáčková",
  description: "AI • ML • Law - blog & projects by Monika Dvořáčková",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  

  return (
    <html lang="en">
      <head>{}</head>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />

      </body>
    </html>
  );
}
