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
  resources?: ResourceItem[];
};

export default function ClientBlog({ posts }: { posts: Post[] }) {
  // vykreslíme A + A kvůli bezešvé smyčce
  const trackPosts = posts.length ? [...posts, ...posts] : [];
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let raf = 0;
    let last = performance.now();
    let x = 0;                  // aktuální posun v px (kladný směr doleva)
    let paused = false;
    const speed = 30;           // px / s -> klidně uprav

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };

    wrapper.addEventListener("mouseenter", onEnter);
    wrapper.addEventListener("mouseleave", onLeave);
    wrapper.addEventListener("touchstart", onEnter, { passive: true });
    wrapper.addEventListener("touchend", onLeave);

    // počkej na fonty, ať se nemění metrika -> žádné první „cuknutí“
    const start = async () => {
      // @ts-ignore
      await (document.fonts?.ready ?? Promise.resolve());
      last = performance.now();
      loop(last);
    };

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused) {
        x += speed * dt;
        // šířka půlky tracku (protože je A + A)
        const half = track.scrollWidth / 2;
        if (x >= half) x -= half;           // „wrap“ bez skoku
        track.style.transform = `translate3d(${-x}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    start();

    return () => {
      cancelAnimationFrame(raf);
      wrapper.removeEventListener("mouseenter", onEnter);
      wrapper.removeEventListener("mouseleave", onLeave);
      wrapper.removeEventListener("touchstart", onEnter);
      wrapper.removeEventListener("touchend", onLeave);
    };
  }, [posts.length]);

  return (
    <div className="overflow-hidden w-full mt-16 px-6">
      <div ref={wrapperRef} className="relative select-none">
        <div
          ref={trackRef}
          className="flex w-max will-change-transform"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {trackPosts.map((post, idx) => (
            <div
              key={`${idx}-${post.slug}`}
              className="relative rounded-2xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
              style={{
                width: 250,
                height: 80,
                marginRight: 24,
                backgroundColor: "rgba(255,255,255,0.6)",
                color: "#000",
                border: "1px solid rgba(0,42,255,0.1)",
                boxShadow: "inset 0 0 0 1px rgba(8,28,244,0.05)",
                flexShrink: 0,
                padding: 16,
                backdropFilter: "blur(6px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: "1rem",
                contain: "layout paint",
              }}
            >
              {/* horní řádek se štítkem a datem */}
              <div className="flex justify-between items-end whitespace-nowrap">
                {post.tags?.[0] && (
                  <Link
                    href={`/tags/${encodeURIComponent(post.tags[0])}`}
                    aria-label={`View all posts with tag: ${post.tags[0]}`}
                    className="bg-[#004cff] text-white px-2 py-0.5 text-[10px] font-semibold rounded mr-1"
                    style={{ color: "white" }}
                  >
                    {post.tags[0]}
                  </Link>
                )}
                <span className="text-[10px] text-black/60">{post.date}</span>
              </div>

              {/* ikonky */}
              {post.resources?.length ? (
                <div className="flex mt-1" style={{ gap: "6px" }}>
                  <ResourceIcons
                    resources={post.resources.slice(0, 3)}
                    showLabels={false}
                    sizeClassName="h-4 w-4"
                  />
                </div>
              ) : null}

              {/* titulek */}
              <Link
                href={`/blog/${post.slug}`}
                aria-label={`Open blog post: ${post.title}`}
                className="text-[11px] font-semibold leading-snug mt-1 whitespace-normal line-clamp-2"
              >
                {post.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
