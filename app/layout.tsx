// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import VercelMetrics from "@/components/VercelMetrics";
import RootFooter from "@/components/RootFooter";

export const metadata: Metadata = {
  title: "Monika Dvořáčková",
  description: "AI • ML • Law - blog & projects by Monika Dvořáčková",
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
