"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ClientBlog from "@/components/ClientBlog";
import WritingList from "@/components/WritingList";

type ResourceType =
  | "github" | "arxiv" | "wandb" | "mlflow" | "model" | "website"
  | "pdf" | "dataset" | "demo" | "colab" | "kaggle";

type Resource = { type: ResourceType; href: string; label?: string };

interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  tldr?: string;
  resources?: Resource[];
  readingMinutes?: number;
  type: string;
}

// ---------- helpers ----------
function isResourceArray(v: unknown): v is Resource[] {
  return Array.isArray(v) && v.every(
    (r) =>
      r &&
      typeof r === "object" &&
      typeof (r as Resource).type === "string" &&
      typeof (r as Resource).href === "string"
  );
}

function normalizePosts(data: unknown): Post[] {
  if (!Array.isArray(data)) return [];
  const out: Post[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.slug !== "string" || typeof obj.title !== "string") continue;
    out.push({
      slug: obj.slug,
      title: obj.title,
      date: typeof obj.date === "string" ? obj.date : "",
      tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
      tldr: typeof obj.tldr === "string" ? obj.tldr : undefined,
      resources: isResourceArray(obj.resources) ? obj.resources : undefined,
      readingMinutes:
        typeof obj.readingMinutes === "number" ? obj.readingMinutes : undefined,
      type: typeof obj.type === "string" ? obj.type : "article",
    });
  }
  return Array.from(new Map(out.map((p) => [p.slug, p])).values());
}

// ---------- section label ----------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 w-full max-w-2xl mx-auto px-6 mb-5">
      <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-black/35">
        {children}
      </span>
      <div className="flex-1 h-px bg-black/10" />
    </div>
  );
}

// ---------- component ----------
export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`GET /api/posts failed: ${res.status} ${text}`);
        }
        return res.json() as Promise<unknown>;
      })
      .then((data) => {
        setPosts(normalizePosts(data));
        setTimeout(() => setIsLoaded(true), 300);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const softwarePosts = posts.filter((p) => p.type === "software");
  const articlePosts = posts.filter((p) => p.type !== "software");

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc] text-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <main className="w-full flex flex-col items-center pt-20 pb-16 flex-1 gap-12">

        {/* ── Software ── */}
        {softwarePosts.length > 0 && (
          <motion.section
            className="w-full flex flex-col items-center gap-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <SectionLabel>Software</SectionLabel>
            <ClientBlog posts={softwarePosts} />
          </motion.section>
        )}

        {/* ── Writing ── */}
        {articlePosts.length > 0 && (
          <motion.section
            className="w-full flex flex-col items-center gap-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <SectionLabel>Writing</SectionLabel>
            <WritingList posts={articlePosts} />
          </motion.section>
        )}

      </main>

      <motion.footer
        className="w-full text-[10px] text-neutral-500 text-center pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        © 2026 Monika Dvorackova
      </motion.footer>
    </motion.div>
  );
}
