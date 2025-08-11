// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import ForceFavicon from "@/components/ForceFavicon";

export const metadata: Metadata = {
  title: "Dvorackova",
  description: "Personal website and blog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const href = "/favicon.png?v=1001";

  return (
    <html lang="en">
      <body>
        <ForceFavicon href={href} />
        {children}
      </body>
    </html>
  );
}
