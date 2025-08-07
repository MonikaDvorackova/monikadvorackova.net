// app/blog/[slug]/page.tsx

import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import React from "react";
import Markdown from "react-markdown";
import ArticleHeader from "@/components/ArticleHeader";
import Link from "next/link";

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
      // ignorovat a pokračovat dalším rozšířením
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
    <div className="overflow-x-hidden min-h-screen bg-gradient-to-br from-[#fef8f3] to-[#f9f5ef] font-sans text-neutral-900">
      <div style={{ padding: "0 4rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <ArticleHeader />
          <hr className="border-gray-200 dark:border-gray-700 my-8" />

          {/* datum + hranaté štítky s mezerou pod datem */}
          <div className="flex flex-col items-center mt-8 mb-6">
            <div className="text-sm text-neutral-800 mb-4">
              {meta.date}
            </div>
            <div className="flex flex-wrap justify-center mb-4">
              {(meta.tags || []).map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  aria-label={`View all posts with tag: ${tag}`}
                  className="inline-block bg-[#004cff] text-white px-2 py-0.5 text-[10px] font-semibold rounded-none"
                  style={{
                    marginRight: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <main>
            <h1 className="text-3xl font-light text-neutral-900 mb-6">
              {meta.title}
            </h1>
            <article style={{ textAlign: "justify", lineHeight: 1.75 }}>
              <Markdown
                components={{
                  strong: ({ children }) => {
                    const txt = React.Children.toArray(children)
                      .join("")
                      .toLowerCase();
                    return txt === "neural" || txt === "natural law" ? (
                      <>{children}</>
                    ) : (
                      <strong>{children}</strong>
                    );
                  },
                }}
              >
                {content}
              </Markdown>
            </article>
          </main>

          <footer className="text-center text-xs text-gray-500 py-8">
            © 2025 Monika Dvorackova
          </footer>
        </div>
      </div>
    </div>
  );
}
