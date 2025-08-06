// app/blog/[slug]/layout.tsx

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { Metadata } from "next";
import { ReactNode } from "react";


export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const postsDir = path.join(process.cwd(), "posts");
  const mdPath = path.join(postsDir, `${params.slug}.md`);
  const mdxPath = path.join(postsDir, `${params.slug}.mdx`);
  let file: string;

  try {
    file = await fs.readFile(mdPath, "utf-8");
  } catch {
    file = await fs.readFile(mdxPath, "utf-8");
  }

  const { data } = matter(file);
  return { title: data.title || params.slug };
}


export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
