// app/blog/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Dvorackova",
  description: "Blog posts and articles",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No <html>/<head> here, and no globals.css import (root už natahuje)
  return <>{children}</>;
}
