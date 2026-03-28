// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import VercelMetrics from "@/components/VercelMetrics";

export const metadata: Metadata = {
  title: "Monika Dvořáčková",
  description: "AI • ML • Law - blog & projects by Monika Dvořáčková",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full">
        {children}
        <footer
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            borderTop: "1px solid rgba(0,0,0,0.10)",
            background: "rgba(253, 242, 233, 0.82)",
            WebkitBackdropFilter: "blur(10px)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            padding: "10px 12px",
            fontSize: 10,
            color: "rgba(0,0,0,0.70)",
            lineHeight: 1.2,
            pointerEvents: "none",
          }}
        >
          © 2026 Monika Dvorackova
        </footer>
        <VercelMetrics />
      </body>
    </html>
  );
}
