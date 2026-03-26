// components/ClientBlog.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import ResourceIcons, { type Resource as ResourceItem } from "@/components/ResourceIcons";

type Post = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  tldr?: string;
  resources?: ResourceItem[];
};

export default function ClientBlog({ posts }: { posts: Post[] }) {
  const trackPosts: Post[] = posts.length ? [...posts, ...posts] : [];
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let raf = 0;
    let last = performance.now();
    let x = 0;
    let paused = false;
    const speed = 28;

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };

    wrapper.addEventListener("mouseenter", onEnter);
    wrapper.addEventListener("mouseleave", onLeave);
    wrapper.addEventListener("touchstart", onEnter, { passive: true });
    wrapper.addEventListener("touchend", onLeave);

    type DocWithFonts = Document & { fonts?: { ready: Promise<void> } };
    const fontsReady: Promise<void> =
      ((document as DocWithFonts).fonts?.ready) ?? Promise.resolve();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused) {
        x += speed * dt;
        const half = track.scrollWidth / 2;
        if (half > 0 && x >= half) x -= half;
        track.style.transform = `translate3d(${-x}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    fontsReady.then(() => {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      wrapper.removeEventListener("mouseenter", onEnter);
      wrapper.removeEventListener("mouseleave", onLeave);
      wrapper.removeEventListener("touchstart", onEnter);
      wrapper.removeEventListener("touchend", onLeave);
    };
  }, [posts.length]);

  if (!posts.length) return null;

  return (
    <div className="overflow-hidden w-full px-6">
      <div ref={wrapperRef} className="relative select-none">
        <div
          ref={trackRef}
          className="flex w-max will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {trackPosts.map((post, idx) => (
            <div
              key={`${post.slug}-card-${idx}`}
              className="relative rounded-2xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
              style={{
                width: 260,
                minHeight: 138,
                marginRight: 20,
                backgroundColor: "rgba(255,255,255,0.72)",
                color: "#000",
                border: "1px solid rgba(0,42,255,0.12)",
                boxShadow: "inset 0 0 0 1px rgba(8,28,244,0.06), 0 4px 16px rgba(0,0,0,0.07)",
                flexShrink: 0,
                padding: "14px 16px 12px",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                borderRadius: "1rem",
                contain: "layout paint",
              }}
            >
              {/* top row: resource icons left, date right */}
              <div className="flex justify-between items-center">
                {post.resources?.length ? (
                  <div className="flex items-center" style={{ gap: 6 }}>
                    <ResourceIcons
                      resources={post.resources.slice(0, 3)}
                      showLabels={false}
                      sizeClassName="h-[14px] w-[14px]"
                    />
                  </div>
                ) : <span />}
                <span className="text-[10px] text-black/50 tabular-nums">{post.date}</span>
              </div>

              {/* title */}
              <Link
                href={`/blog/${post.slug}`}
                aria-label={`Open: ${post.title}`}
                className="text-[12px] font-semibold leading-snug line-clamp-2 hover:text-[#004cff] transition-colors"
              >
                {post.title}
              </Link>

              {/* TLDR */}
              {post.tldr && (
                <p className="text-[10px] leading-[1.5] text-black/55 line-clamp-2 mt-auto">
                  {post.tldr}
                </p>
              )}

              {/* tag pill at the bottom */}
              {post.tags?.[0] && (
                <div className="mt-auto pt-1">
                  <Link
                    href={`/tags/${encodeURIComponent(post.tags[0])}`}
                    aria-label={`Tag: ${post.tags[0]}`}
                    className="inline-block bg-[#004cff] text-white px-2 py-0.5 text-[9px] font-semibold rounded"
                  >
                    {post.tags[0]}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
