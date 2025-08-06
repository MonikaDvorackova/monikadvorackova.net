"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientBlog from "@/components/ClientBlog";

interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
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

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json() as Promise<Post[]>)
      .then((data) => {
        const unique = Array.from(new Map(data.map((p) => [p.slug, p])).values());
        setPosts(unique);
      });
  }, []);

  useEffect(() => {
    const titleInterval = setInterval(() => {
      setTitleIndex((i) => (i + 1) % blogTitles.length);
    }, 4000);
    return () => clearInterval(titleInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc] text-neutral-900">
      <main className="w-full flex flex-col items-center justify-center px-4 text-center pt-20 flex-1">
        <div className="text-base md:text-lg font-medium mb-2 min-h-[1.75rem]">
          <AnimatePresence mode="wait">
            <CrossfadeWord word={blogTitles[titleIndex]} />
          </AnimatePresence>
        </div>

        <p className="text-sm italic text-neutral-600 mb-10">
          Thoughts & analysis on AI, law, and everything between.
        </p>

        <div className="w-full max-w-screen-lg">
          <ClientBlog posts={posts} />
        </div>
      </main>

      <footer className="w-full text-[10px] text-neutral-500 text-center pb-4">
        © 2025 Monika Dvorackova
      </footer>
    </div>
  );
}
