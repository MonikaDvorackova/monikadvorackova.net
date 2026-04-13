"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import CarouselEdgeFog from "@/components/CarouselEdgeFog";
import PostListingCard, { type ListingPost } from "@/components/PostListingCard";
import { useBlogCarouselMobileLayout } from "@/lib/blogCarouselMobileMedia";

export default function WritingList({ posts }: { posts: ListingPost[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);

  const isMobile = useBlogCarouselMobileLayout();

  const useMarquee = posts.length >= 2 && !isMobile;
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
        className="relative w-full overflow-hidden no-scrollbar select-none"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingLeft: 6,
          paddingRight: 6,
          touchAction: "manipulation",
        }}
      >
        <CarouselEdgeFog />
        <div
          className="blog-carousel-mobile-marquee relative z-0 flex w-max items-stretch gap-2 py-0.5 px-0.5"
          style={
            {
              "--blog-marquee-sec": "40s",
              animation:
                "blog-carousel-marquee var(--blog-marquee-sec, 40s) linear infinite",
              WebkitAnimation:
                "blog-carousel-marquee var(--blog-marquee-sec, 40s) linear infinite",
            } as CSSProperties
          }
        >
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
      >
        <CarouselEdgeFog />
        <div
          ref={trackRef}
          className="relative z-0 flex w-max items-stretch will-change-transform pl-1 pr-1"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {firstLoop.map((post) => (
            <div key={`${post.slug}-writing-a`} className="flex shrink-0 self-stretch">
              <PostListingCard
                post={post}
                onPointerInsideCard={() => {
                  pausedRef.current = true;
                }}
              />
            </div>
          ))}
          {secondLoop.map((post) => (
            <div key={`${post.slug}-writing-b`} className="flex shrink-0 self-stretch">
              <PostListingCard
                post={post}
                onPointerInsideCard={() => {
                  pausedRef.current = true;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}