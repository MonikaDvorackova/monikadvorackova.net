"use client";

import Link from "next/link";

type Post = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  tldr?: string;
  readingMinutes?: number;
};

export default function WritingList({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group relative block overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004cff]/50"
            style={{
              width: "clamp(340px, 62vw, 520px)",
              height: 78,
              backgroundColor: "rgba(255,255,255,0.72)",
              color: "#000",
              border: "1px solid rgba(0,42,255,0.12)",
              boxShadow:
                "inset 0 0 0 1px rgba(8,28,244,0.06), 0 4px 16px rgba(0,0,0,0.07)",
              padding: "12px 16px 10px",
              backdropFilter: "blur(8px)",
              borderRadius: "1rem",
              contain: "layout paint",
            }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="line-clamp-2 text-[12px] font-semibold leading-snug transition-colors group-hover:text-[#004cff]">
                    {post.title}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[10px] text-black/50 tabular-nums">{post.date}</div>
                  {typeof post.readingMinutes === "number" && post.readingMinutes > 0 ? (
                    <div className="mt-0.5 text-[10px] text-black/35 tabular-nums">
                      {post.readingMinutes} min
                    </div>
                  ) : null}
                </div>
              </div>

              {post.tldr ? (
                <p className="mt-2 line-clamp-3 text-[10px] leading-[1.5] text-black/55">
                  {post.tldr}
                </p>
              ) : (
                <div className="mt-2" />
              )}

              <div className="mt-auto pt-3">
                {post.tags?.length ? (
                  <div className="flex flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center whitespace-nowrap rounded px-2.5 py-1 text-[10px] font-semibold leading-none"
                        style={{
                          backgroundColor: "#004cff",
                          color: "#fff",
                          WebkitTextFillColor: "#fff",
                          marginRight: 10,
                          marginBottom: 8,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ height: 12 }} />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
