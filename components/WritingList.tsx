"use client";

import { useEffect, useRef, useState } from "react";
import PostListingCard, { type ListingPost } from "@/components/PostListingCard";
import { useMobileMarqueeAutoplay } from "@/components/useMobileMarqueeAutoplay";

export default function WritingList({ posts }: { posts: ListingPost[] }) {
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
        <PostListingCard post={posts[0]} solo mobileSolo={isMobile} />
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
        <div className="flex w-max items-stretch gap-[14px] py-0.5 pl-1 pr-1">
          {posts.map((post) => (
            <div key={`${post.slug}-a`} className="flex shrink-0 self-stretch">
              <PostListingCard post={post} solo mobileSolo={isMobile} />
            </div>
          ))}
          {posts.map((post) => (
            <div key={`${post.slug}-b`} className="flex shrink-0 self-stretch">
              <PostListingCard post={post} solo mobileSolo={isMobile} />
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
            <PostListingCard
              key={`${post.slug}-writing-a`}
              post={post}
              onPointerInsideCard={() => {
                pausedRef.current = true;
              }}
            />
          ))}
          {secondLoop.map((post) => (
            <PostListingCard
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