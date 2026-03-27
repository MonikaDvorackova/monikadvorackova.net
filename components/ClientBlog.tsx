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

function BlogCard({ post }: { post: Post }) {
  return (
    <div
      className="relative rounded-2xl transition-transform duration-300 hover:scale-[1.03] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
      style={{
        width: 260,
        minHeight: 138,
        marginRight: 20,
        backgroundColor: "rgba(255,255,255,0.72)",
        color: "#000",
        border: "1px solid rgba(0,42,255,0.12)",
        boxShadow:
          "inset 0 0 0 1px rgba(8,28,244,0.06), 0 4px 16px rgba(0,0,0,0.07)",
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
      <div className="flex items-center justify-between">
        {post.resources?.length ? (
          <div className="flex items-center" style={{ gap: 6 }}>
            <ResourceIcons
              resources={post.resources.slice(0, 3)}
              showLabels={false}
              sizeClassName="h-[14px] w-[14px]"
            />
          </div>
        ) : (
          <span />
        )}

        <span className="text-[10px] text-black/50 tabular-nums">{post.date}</span>
      </div>

      <Link
        href={`/blog/${post.slug}`}
        aria-label={`Open: ${post.title}`}
        className="text-[12px] font-semibold leading-snug line-clamp-2 hover:text-[#004cff] transition-colors"
      >
        {post.title}
      </Link>

      {post.tldr && (
        <p className="text-[10px] leading-[1.5] text-black/55 line-clamp-2 mt-auto">
          {post.tldr}
        </p>
      )}

      {post.tags?.[0] && (
        <div className="mt-auto pt-1">
          <Link
            href={`/tags/${encodeURIComponent(post.tags[0])}`}
            aria-label={`Tag: ${post.tags[0]}`}
            className="inline-block bg-[#004cff] text-white px-2 py-0.5 text-[9px] font-semibold rounded"
            style={{
              color: "#fff",
              WebkitTextFillColor: "#fff",
            }}
          >
            {post.tags[0]}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ClientBlog({ posts }: { posts: Post[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const shouldMarquee = posts.length >= 1;
  const firstLoop = posts;
  const secondLoop = posts;

  useEffect(() => {
    if (!shouldMarquee) return;

    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let raf = 0;
    let last = performance.now();
    let x = 0;
    let paused = false;
    const speed = 28;
    let startX = 0;
    let centerPad = 0;

    const onEnter = () => {
      paused = true;
    };

    const onLeave = () => {
      paused = false;
    };

    wrapper.addEventListener("mouseenter", onEnter);
    wrapper.addEventListener("mouseleave", onLeave);
    wrapper.addEventListener("touchstart", onEnter, { passive: true });
    wrapper.addEventListener("touchend", onLeave);

    type DocWithFonts = Document & { fonts?: { ready: Promise<void> } };
    const fontsReady: Promise<void> =
      ((document as DocWithFonts).fonts?.ready) ?? Promise.resolve();

    const recomputeStart = () => {
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      centerPad = Math.max(0, (wrapper.clientWidth - half) / 2);
      startX = 0;
      x = startX;
      track.style.transform = `translate3d(${centerPad - x}px,0,0)`;
    };

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused) {
        x += speed * dt;
        const half = track.scrollWidth / 2;
        if (half > 0 && x >= half) x -= half;
        track.style.transform = `translate3d(${centerPad - x}px,0,0)`;
      }

      raf = requestAnimationFrame(loop);
    };

    fontsReady.then(() => {
      recomputeStart();
      last = performance.now();
      raf = requestAnimationFrame(loop);
    });

    const onResize = () => recomputeStart();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      wrapper.removeEventListener("mouseenter", onEnter);
      wrapper.removeEventListener("mouseleave", onLeave);
      wrapper.removeEventListener("touchstart", onEnter);
      wrapper.removeEventListener("touchend", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [shouldMarquee, posts.length]);

  if (!posts.length) return null;

  return (
    <div className="w-full">
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden select-none"
        style={{
          // keep motion focused in center; fade/clip before page edges
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.10) 10%, rgba(0,0,0,0.55) 18%, black 30%, black 70%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.10) 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.10) 10%, rgba(0,0,0,0.55) 18%, black 30%, black 70%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.10) 90%, transparent 100%)",
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max will-change-transform pl-1 pr-1"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {firstLoop.map((post) => (
            <BlogCard key={`${post.slug}-card-a`} post={post} />
          ))}

          {secondLoop.map((post) => (
            <BlogCard key={`${post.slug}-card-b`} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
