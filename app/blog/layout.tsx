// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ForceFavicon from "@/components/ForceFavicon";

export const metadata: Metadata = {
  title: "Monika Dvořáčková",
  description: "Personal website and blog",
  // Záměrně BEZ `icons` – ať není kolize
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const href = "/favicon.png?v=1001";

  return (
    <html lang="en">
      {/* ŽÁDNÉ <head> ručně – necháme to na ForceFavicon */}
      <body>
        <ForceFavicon href={href} />
        {children}
      </body>
    </html>
  );
}
