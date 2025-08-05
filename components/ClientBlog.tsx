"use client";

import { useState } from "react";
import clsx from "clsx"; 

type Post = {
  title: string;
  date: string;
};

export default function ClientBlog({ posts }: { posts: Post[] }) {

  const displayPosts = Array(6).fill(posts).flat(); 
  const [pausedIndex, setPausedIndex] = useState<number | null>(null);

  return (
    <div className="overflow-hidden w-full mt-16 px-6">
      <div
        className={clsx("flex w-max", pausedIndex !== null && "animate-paused")}
        style={{
          animation: "scroll-loop 70s linear infinite",
        }}
      >
        {displayPosts.map((post: Post, idx: number) => (
          <div
            key={`${idx}-${post.title}`}
            onMouseEnter={() => setPausedIndex(idx)}
            onMouseLeave={() => setPausedIndex(null)}
            className="relative rounded-2xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
            style={{
              width: "200px",
              height: "60px",
              marginRight: "24px",
              backgroundColor: "rgba(255,255,255,0.6)",
              color: "#000000",
              border: "1px solid rgba(0, 42, 255, 0.1)",
              boxShadow: "inset 0 0 0 1px rgba(8, 28, 244, 0.05)",
              flexShrink: 0,
              padding: "12px",
              backdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "1rem",
            }}
          >
            {/* 🔵 Label + datum */}
            <div className="flex justify-between items-end">
              <span
                style={{
                  backgroundColor: "#004cff",
                  color: "#ffffff",
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: 600,
                  borderRadius: "4px",
                }}
              >
                AI
              </span>
              <span className="text-[10px] text-black/60">{post.date}</span>
            </div>

            {/* 📄 Text */}
            <div className="text-[11px] font-semibold leading-snug mt-1 whitespace-normal">
              {post.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
