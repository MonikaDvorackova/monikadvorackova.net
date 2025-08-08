"use client";

import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";

type Post = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
};

export default function ClientBlog({ posts }: { posts: Post[] }) {
  // Vytvoříme mnohem více duplikátů pro skutečně plynulý scroll
  const displayPosts = Array(10).fill(posts).flat(); // 10 sad postů
  const [paused, setPaused] = useState(false);

  return (
    <div className="overflow-hidden w-full mt-16 px-6">
      <div
        className={clsx("flex w-max no-scrollbar animate-scroll-loop")}
        style={{
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {displayPosts.map((post: Post, idx: number) => (
          <div
            key={`${idx}-${post.slug}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="relative rounded-2xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
            style={{
              width: 250,
              height: 80,
              marginRight: 24,
              backgroundColor: "rgba(255,255,255,0.6)",
              color: "#000000",
              border: "1px solid rgba(0, 42, 255, 0.1)",
              boxShadow: "inset 0 0 0 1px rgba(8, 28, 244, 0.05)",
              flexShrink: 0,
              padding: 16,
              backdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "1rem",
            }}
          >
            <div className="flex justify-between items-end">
              {post.tags?.[0] && (
                <Link
                  href={`/tags/${encodeURIComponent(post.tags[0])}`}
                  aria-label={`View all posts with tag: ${post.tags[0]}`}
                  className="bg-[#004cff] text-white px-2 py-0.5 text-[10px] font-semibold rounded mr-1"
                  style={{ color: 'white' }}
                >
                  {post.tags[0]}
                </Link>
              )}

              <span className="text-[10px] text-black/60">{post.date}</span>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              aria-label={`Open blog post: ${post.title}`}
              className="text-[11px] font-semibold leading-snug mt-1 whitespace-normal"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
