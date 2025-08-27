// components/ClientBlog.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import ResourceIcons, { type Resource as ResourceItem } from "@/components/ResourceIcons";

type Post = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  resources?: ResourceItem[];
  readingMinutes?: number;
};

export default function ClientBlog({ posts }: { posts: Post[] }) {
  const displayPosts = Array(10).fill(posts).flat();
  const [paused, setPaused] = useState(false);

  return (
    <div className="overflow-hidden w-full mt-16 px-6">
      <div
        className={clsx("flex w-max no-scrollbar animate-scroll-loop")}
        // Pauza celé kolejnice = žádné „ujíždění“ pod kurzorem
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setTimeout(() => setPaused(false), 120)}
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {displayPosts.map((post, idx) => (
          <div
            key={`${idx}-${post.slug}`}
            className={clsx(
              "group relative mr-6 flex-shrink-0 rounded-2xl",
              "overflow-hidden",               // pevný obal = bez reflow
              "ring-1 ring-[rgba(0,42,255,0.1)]",
              "shadow-[inset_0_0_0_1px_rgba(8,28,244,0.05)]",
              "bg-white/60"
            )}
            style={{
              width: 250,
              height: 80,
              backdropFilter: "blur(6px)",
              contain: "layout paint",          // izolace přepočtů layoutu
            }}
          >
            {/* Celá karta je klikací – absolutní overlay */}
            <Link
              href={`/blog/${post.slug}`}
              aria-label={`Open blog post: ${post.title}`}
              className="absolute inset-0 block"
            >
              {/* Interaktivní vrstva – škáluje bez vlivu na layout */}
              <div
                className={clsx(
                  "absolute inset-0 p-4",
                  "transition-transform duration-300 will-change-transform",
                  "group-hover:scale-[1.02]"     // jemný efekt bez posunu
                )}
              >
                {/* horní řádek se štítkem a datem */}
                <div className="flex justify-between items-end">
                  {post.tags?.[0] && (
                    <span
                      className="bg-[#004cff] text-white px-2 py-0.5 text-[10px] font-semibold rounded mr-1"
                    >
                      {post.tags[0]}
                    </span>
                  )}
                  <span className="text-[10px] text-black/60">
                    {post.date}
                    {typeof post.readingMinutes === "number"
                      ? ` · ${post.readingMinutes} min read`
                      : ""}
                  </span>
                </div>

                {/* ikonky */}
                {post.resources?.length ? (
                  <div className="flex mt-1 gap-[6px]">
                    <ResourceIcons
                      resources={post.resources.slice(0, 3)}
                      showLabels={false}
                      sizeClassName="h-4 w-4"
                    />
                  </div>
                ) : null}

                {/* titulek */}
                <h3 className="text-[11px] font-semibold leading-snug mt-1 line-clamp-2">
                  {post.title}
                </h3>
              </div>
            </Link>

            {/* Hover zvýraznění bez změny rozměru */}
            <div
              className="pointer-events-none absolute inset-0 transition-[box-shadow] duration-300 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
