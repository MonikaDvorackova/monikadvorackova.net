// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ForceFavicon from "@/components/ForceFavicon";

export const metadata: Metadata = {
  title: "Monika Dvořáčková",
  description: "Personal website and blog",

};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const href = "/icon.png?v=20250811";

  return (
    <html lang="en">
      <head>
        {/* SSR link – je tam hned po renderu */}
        <link rel="icon" type="image/png" href={href} />
        <link rel="shortcut icon" href={href} />
        <link rel="apple-touch-icon" href={href} />
      </head>
      <body>
        <ForceFavicon href={href} />
        {children}
      </body>
    </html>
  );
}
