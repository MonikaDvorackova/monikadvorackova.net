// app/blog/[slug]/layout.tsx

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { Metadata } from "next";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  // Asynchronně vyčkáme na params
  const { slug } = await props.params;

  const postsDir = path.join(process.cwd(), "posts");

  for (const ext of [".md", ".mdx"] as const) {
    try {
      const file = await fs.readFile(path.join(postsDir, `${slug}${ext}`), "utf8");
      const { data } = matter(file);
      return {
        title: data.title || slug,
        description: data.description || `Post: ${slug}`,
      };
    } catch {
      // ignorovat chybu, pokračovat dalším příponám
    }
  }

  return { title: "Not found" };
}

export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
