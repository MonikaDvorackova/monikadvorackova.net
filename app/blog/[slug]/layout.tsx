// app/blog/[slug]/layout.tsx

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { Metadata } from "next";
import { ReactNode } from "react";

async function getPostTitle(slug: string): Promise<string> {
  try {
    const postsDir = path.join(process.cwd(), "posts");
    const mdPath = path.join(postsDir, `${slug}.md`);
    const mdxPath = path.join(postsDir, `${slug}.mdx`);
    let file: string;
    try {
      file = await fs.readFile(mdPath, "utf-8");
    } catch {
      file = await fs.readFile(mdxPath, "utf-8");
    }
    const { data } = matter(file);
    return data.title || slug;
  } catch {
    return slug;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const title = await getPostTitle(params.slug);
  return { title };
}

export default function BlogPostLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // Tento wrapper se použije jen pro /blog/[slug] stránky:
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
