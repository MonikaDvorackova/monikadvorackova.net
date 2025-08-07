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

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  // awaitujeme params předtím, než je použijeme
  const { slug } = await props.params;
  const title = await getPostTitle(slug);
  return { title };
}

export default function BlogPostLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
