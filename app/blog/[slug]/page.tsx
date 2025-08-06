import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

async function getPostRaw(slug: string) {
  const postsDir = path.join(process.cwd(), "posts");
  for (const ext of [".md", ".mdx"] as const) {
    try {
      return await fs.readFile(path.join(postsDir, `${slug}${ext}`), "utf8");
    } catch {}
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const raw = await getPostRaw(slug);
  if (raw) {
    const data = matter(raw).data as PostMeta;
    return { title: data.title };
  }
  return { title: "Not found" };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = params;
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

          {/* datum a štítky */}
          <div className="flex flex-col items-center mt-8 mb-6 gap-10">
            {/* kalendář + datum */}
            <div className="flex items-center gap-10">
              <span className="text-xs text-indigo-600">{meta.date}</span>
            </div>

            {/* hlavní štítek */}
            {meta.tags && meta.tags.length > 0 && (
              <div className="flex justify-center">
                <Link
                  href={`/blog/tag/${encodeURIComponent(meta.tags[0])}`}
                  className="bg-blue-600 text-white px-3 py-1 text-[10px] font-semibold rounded-md hover:bg-blue-700 transition-colors"
                >
                  {meta.tags[0]}
                </Link>
              </div>
            )}
          </div>

          <main>
            <h1 style={{ fontWeight: 300, fontSize: "1.875rem", marginBottom: "1.5rem", color: "#111827" }}>
              {meta.title}
            </h1>
            <article style={{ textAlign: "justify", lineHeight: 1.75 }}>
              <Markdown
                components={{
                  strong: ({ children }) => {
                    const txt = React.Children.toArray(children).join("").toLowerCase();
                    return txt === "neural" || txt === "natural law"
                      ? <>{children}</>
                      : <strong>{children}</strong>;
                  },
                }}
              >
                {content}
              </Markdown>
            </article>
          </main>

          <footer style={{ fontSize: "0.625rem", textAlign: "center", padding: "2rem 0", color: "#6B7280" }}>
            © 2025 Monika Dvorackova
          </footer>
        </div>
      </div>
    </div>
  );
}
