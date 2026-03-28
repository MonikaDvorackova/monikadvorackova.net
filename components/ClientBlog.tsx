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
  readingMinutes?: number;
};

function BlogCard({
  post,
  solo = false,
  onPointerInsideCard,
}: {
  post: Post;
  solo?: boolean;
  onPointerInsideCard?: () => void;
}) {
  return (
    <div
      className="relative overflow-visible rounded-2xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] focus-visible:ring-2 focus-visible:ring-[#004cff]/50"
      onPointerEnter={onPointerInsideCard}
      style={{
        width: 260,
        minHeight: 138,
        marginRight: solo ? 0 : 20,
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
      <div className="flex min-h-[56px] items-start justify-between gap-2">
        <Link
          href={`/blog/${post.slug}`}
          aria-label={`Open: ${post.title}`}
          title={post.title}
          className="min-w-0 flex-1 self-start text-[11px] font-semibold leading-snug text-[#004cff] line-clamp-2 hover:opacity-90 transition-opacity"
        >
          {post.title}
        </Link>

        <div className="flex min-h-[56px] shrink-0 flex-col items-end justify-start gap-1">
          <span className="text-[9px] font-medium tabular-nums text-black">{post.date}</span>
          <span className="mb-0.5 text-[9px] tabular-nums text-black leading-tight">
            {Math.max(1, post.readingMinutes ?? 1)} min
          </span>
          <div className="mt-1 flex min-h-[15px] w-full items-end justify-end">
            {post.resources?.length ? (
              <ResourceIcons
                resources={post.resources.slice(0, 8)}
                showLabels={false}
                sizeClassName="h-[13px] w-[13px]"
                className="justify-end"
              />
            ) : null}
          </div>
        </div>
      </div>

      {post.tldr && (
        <p className="mt-auto whitespace-pre-line text-[9px] leading-[1.5] text-black">
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
  const pausedRef = useRef(false);

  const useMarquee = posts.length >= 2;
  const firstLoop = posts;
  const secondLoop = posts;

  useEffect(() => {
    if (!useMarquee) return;

    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let raf = 0;
    let last = performance.now();
    let x = 0;
    const speedDesktop = 22;
    const speedMobile = 14;
    let speed = window.matchMedia("(max-width: 639px)").matches ? speedMobile : speedDesktop;
    let centerPad = 0;

    type DocWithFonts = Document & { fonts?: { ready: Promise<void> } };
    const fontsReady: Promise<void> =
      ((document as DocWithFonts).fonts?.ready) ?? Promise.resolve();

    const recomputeStart = () => {
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      centerPad = Math.max(0, (wrapper.clientWidth - half) / 2);
      x = 0;
      track.style.transform = `translate3d(${centerPad - x}px,0,0)`;
    };

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!pausedRef.current) {
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

    const onResize = () => {
      speed = window.matchMedia("(max-width: 639px)").matches ? speedMobile : speedDesktop;
      recomputeStart();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [useMarquee, posts.length]);

  if (!posts.length) return null;

  if (posts.length === 1) {
    return (
      <div className="w-full flex justify-center">
        <BlogCard post={posts[0]} solo />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden select-none"
        onPointerEnter={() => {
          pausedRef.current = true;
        }}
        onPointerLeave={() => {
          pausedRef.current = false;
        }}
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 14%, rgba(0,0,0,0.35) 22%, black 38%, black 62%, rgba(0,0,0,0.35) 78%, rgba(0,0,0,0.06) 86%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 14%, rgba(0,0,0,0.35) 22%, black 38%, black 62%, rgba(0,0,0,0.35) 78%, rgba(0,0,0,0.06) 86%, transparent 100%)",
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max will-change-transform pl-1 pr-1"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {firstLoop.map((post) => (
            <BlogCard
              key={`${post.slug}-card-a`}
              post={post}
              onPointerInsideCard={() => {
                pausedRef.current = true;
              }}
            />
          ))}

          {secondLoop.map((post) => (
            <BlogCard
              key={`${post.slug}-card-b`}
              post={post}
              onPointerInsideCard={() => {
                pausedRef.current = true;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
