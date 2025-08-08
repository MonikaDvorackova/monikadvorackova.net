// app/blog/[slug]/page.tsx

import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import React from "react";
import AnimatedBlogPost from "./AnimatedBlogPost";

interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
}

export const dynamic = "force-dynamic";

async function getPostRaw(slug: string) {
  const postsDir = path.join(process.cwd(), "posts");
  for (const ext of [".md", ".mdx"] as const) {
    try {
      return await fs.readFile(path.join(postsDir, `${slug}${ext}`), "utf8");
    } catch {
     
    }
  }
  return null;
}

export default async function BlogPostPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const raw = await getPostRaw(slug);
  if (!raw) notFound();

  const { data, content } = matter(raw);
  const meta = data as PostMeta;

  return (
    <AnimatedBlogPost
      meta={meta}
      content={content}
    />
  );
}
