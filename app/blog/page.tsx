"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientBlog from "@/components/ClientBlog";

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
  readingMinutes?: number; // ← pro „X min read“ v ClientBlog
}

function CrossfadeWord({ word }: { word: string }) {
  return (
    <motion.span
      key={word}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.4 }}
      className="inline-block"
    >
      {word}
    </motion.span>
  );
}

const blogTitles = [
  "From Code to Compliance",
  "Neural & Natural Law",
  "Machines & Mandates",
];

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [titleIndex, setTitleIndex] = useState(0);
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
        if (!Array.isArray(data)) {
          console.error("Unexpected /api/posts payload:", data);
          return;
        }
        // Deduplicate by slug + assert minimal shape
        const cleaned = data
          .filter((p: any) => p && typeof p.slug === "string" && typeof p.title === "string")
          .map((p: any) => ({
            slug: String(p.slug),
            title: String(p.title),
            date: String(p.date ?? ""),
            tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
            tldr: p.tldr != null ? String(p.tldr) : undefined,
            resources: Array.isArray(p.resources) ? p.resources : undefined,
            readingMinutes: typeof p.readingMinutes === "number" ? p.readingMinutes : undefined,
          })) as Post[];

        const unique = Array.from(new Map(cleaned.map((p) => [p.slug, p])).values());
        setPosts(unique);
        setTimeout(() => setIsLoaded(true), 300);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const titleInterval = setInterval(() => {
      setTitleIndex((i) => (i + 1) % blogTitles.length);
    }, 4000);
    return () => clearInterval(titleInterval);
  }, []);

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc] text-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <main className="w-full flex flex-col items-center justify-center px-4 text-center pt-20 flex-1">
        <motion.div
          className="text-base md:text-lg font-medium mb-2 min-h-[1.75rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <CrossfadeWord word={blogTitles[titleIndex]} />
          </AnimatePresence>
        </motion.div>

        <motion.p
          className="text-sm italic text-neutral-600 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Thoughts & analysis on AI, law, and everything between.
        </motion.p>

        <motion.div
          className="w-full max-w-screen-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <ClientBlog posts={posts} />
        </motion.div>
      </main>

      <motion.footer
        className="w-full text-[10px] text-neutral-500 text-center pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        © 2025 Monika Dvorackova
      </motion.footer>
    </motion.div>
  );
}
