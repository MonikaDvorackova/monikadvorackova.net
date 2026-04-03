"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ResourceIcons, { type Resource as ResourceItem } from "@/components/ResourceIcons";
import { useMobileMarqueeAutoplay } from "@/components/useMobileMarqueeAutoplay";

type Post = {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  tldr?: string;
  readingMinutes?: number;
  resources?: ResourceItem[];
};

function WritingCard({
  post,
  solo = false,
  mobileSolo = false,
  onPointerInsideCard,
}: {
  post: Post;
  solo?: boolean;
  mobileSolo?: boolean;
  onPointerInsideCard?: () => void;
}) {
  const href = `/blog/${post.slug}`;

  return (
    <div
      className="group relative block overflow-visible rounded-2xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] focus-within:ring-2 focus-within:ring-[#004cff]/50"
      onPointerEnter={onPointerInsideCard}
      style={{
        width: solo ? (mobileSolo ? "min(84vw, 360px)" : "min(86vw, 360px)") : 420,
        minHeight: solo ? undefined : 78,
        marginRight: solo ? 0 : 16,
        backgroundColor: "rgba(255,255,255,0.72)",
        color: "#000",
        border: "1px solid rgba(0,42,255,0.12)",
        boxShadow: "inset 0 0 0 1px rgba(8,28,244,0.06), 0 4px 16px rgba(0,0,0,0.07)",
        padding: solo ? "16px 16px 14px" : "12px 16px 10px",
        backdropFilter: "blur(8px)",
        borderRadius: "1rem",
        contain: "layout paint",
        flexShrink: 0,
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex min-h-[56px] items-start justify-between gap-3">
          <Link
            href={href}
            className="min-w-0 flex-1 self-start line-clamp-2 text-[11px] font-semibold leading-snug text-[#004cff] transition-opacity group-hover:opacity-90"
            title={post.title}
          >
            {post.title}
          </Link>

          <div className="flex min-h-[56px] shrink-0 flex-col items-end justify-start gap-1 text-right">
            <div className="text-[9px] font-medium tabular-nums text-black">{post.date}</div>
            <div className="mb-0.5 text-[9px] tabular-nums text-black leading-tight">
              {Math.max(1, typeof post.readingMinutes === "number" ? post.readingMinutes : 1)} min
            </div>
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

        {post.tldr ? (
          <Link
            href={href}
            className="mt-2 block text-black no-underline visited:text-black hover:text-black focus-visible:text-black"
            style={{ color: "#000" }}
          >
            <p
              className="line-clamp-3 text-[9px] leading-[1.5]"
              style={{ color: "#000", WebkitTextFillColor: "#000" }}
            >
              {post.tldr}
            </p>
          </Link>
        ) : (
          <div className="mt-2" />
        )}

        <div className="mt-auto pt-3">
          {post.tags?.length ? (
            <div className="flex flex-wrap gap-x-[10px] gap-y-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center whitespace-nowrap rounded px-2.5 py-1 text-[9px] font-semibold leading-none"
                  style={{
                    backgroundColor: "#004cff",
                    color: "#fff",
                    WebkitTextFillColor: "#fff",
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
    </div>
  );
}

export default function WritingList({ posts }: { posts: Post[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();

    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  const useMarquee = posts.length >= 2 && !isMobile;
  const firstLoop = posts;
  const secondLoop = posts;
  const mobileContentKey = posts.map((p) => p.slug).join("|");

  useMobileMarqueeAutoplay(mobileScrollerRef, isMobile && posts.length >= 2, mobileContentKey, {
    speedPxPerSec: 11,
    idleResumeMs: 1000,
  });

  useEffect(() => {
    if (!useMarquee) return;

    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let raf = 0;
    let last = performance.now();
    let x = 0;
    let centerPad = 0;
    const speedDesktop = 20;
    const speedMobile = 14;
    let speed = window.matchMedia("(max-width: 639px)").matches ? speedMobile : speedDesktop;

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
        <WritingCard post={posts[0]} solo mobileSolo={isMobile} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        ref={mobileScrollerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar select-none"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingLeft: 8,
          paddingRight: 28,
          touchAction: "pan-x",
        }}
      >
        <div className="flex w-max gap-[14px] py-0.5 pl-1 pr-1">
          {posts.map((post) => (
            <div key={`${post.slug}-a`} className="shrink-0">
              <WritingCard post={post} solo mobileSolo={isMobile} />
            </div>
          ))}
          {posts.map((post) => (
            <div key={`${post.slug}-b`} className="shrink-0">
              <WritingCard post={post} solo mobileSolo={isMobile} />
            </div>
          ))}
        </div>
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
            <WritingCard
              key={`${post.slug}-writing-a`}
              post={post}
              onPointerInsideCard={() => {
                pausedRef.current = true;
              }}
            />
          ))}
          {secondLoop.map((post) => (
            <WritingCard
              key={`${post.slug}-writing-b`}
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
