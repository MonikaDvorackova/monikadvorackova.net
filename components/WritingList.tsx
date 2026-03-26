// components/WritingList.tsx
"use client";

import Link from "next/link";

type Post = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
};

export default function WritingList({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 flex flex-col">
      {posts.map((post, idx) => (
        <div
          key={post.slug}
          className="group flex items-baseline gap-4 py-3 transition-opacity duration-200 hover:opacity-80"
          style={{
            borderTop: idx === 0 ? "none" : "1px solid rgba(0,0,0,0.07)",
          }}
        >
          {/* date */}
          <span className="shrink-0 text-[10px] tabular-nums text-black/40 w-[72px]">
            {post.date}
          </span>

          {/* title */}
          <Link
            href={`/blog/${post.slug}`}
            aria-label={`Open: ${post.title}`}
            className="flex-1 text-[12px] font-medium leading-snug text-neutral-800 group-hover:text-[#004cff] transition-colors"
          >
            {post.title}
          </Link>

          {/* tag */}
          {post.tags?.[0] && (
            <Link
              href={`/tags/${encodeURIComponent(post.tags[0])}`}
              aria-label={`Tag: ${post.tags[0]}`}
              className="shrink-0 text-[9px] font-semibold text-[#004cff] opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              {post.tags[0]}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
