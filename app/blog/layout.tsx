import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Monika Dvořáčková",
  description: "Blog posts and articles",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
