"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import CarouselEdgeFog from "@/components/CarouselEdgeFog";
import PostListingCard, { type ListingPost } from "@/components/PostListingCard";
import { useBlogCarouselMobileLayout } from "@/lib/blogCarouselMobileMedia";

export default function ClientBlog({ posts, extras = [] }: { posts: ListingPost[]; extras?: ListingPost[] }) {
  const allPosts = [...posts, ...extras];
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);

  const isMobile = useBlogCarouselMobileLayout();

  const useMarquee = allPosts.length >= 2 && !isMobile;
  const firstLoop = allPosts;
  const secondLoop = allPosts;

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
  }, [useMarquee, allPosts.length]);

  if (!allPosts.length) return null;

  if (allPosts.length === 1) {
    return (
      <div className="w-full flex justify-center">
        <PostListingCard
          post={allPosts[0]}
          solo
          mobileSolo={isMobile}
          anchorId={allPosts[0].slug === "aigov" ? "aigov" : undefined}
        />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar select-none"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingLeft: 6,
          paddingRight: 6,
          touchAction: "pan-x pan-y",
        }}
      >
        <CarouselEdgeFog />
        <div
          className="blog-carousel-mobile-marquee relative z-0 flex w-max items-stretch gap-2 py-0.5 px-0.5"
          onTouchStart={(e) => { e.currentTarget.style.animationPlayState = "paused"; }}
          onTouchEnd={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
          onTouchCancel={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
          style={
            {
              "--blog-marquee-sec": "38s",
              animation:
                "blog-carousel-marquee var(--blog-marquee-sec, 38s) linear infinite",
              WebkitAnimation:
                "blog-carousel-marquee var(--blog-marquee-sec, 38s) linear infinite",
            } as CSSProperties
          }
        >
          {allPosts.map((post) => (
            <div key={`${post.slug}-a`} className="flex shrink-0 self-stretch">
              <PostListingCard
                post={post}
                solo
                mobileSolo={isMobile}
                anchorId={post.slug === "aigov" ? "aigov" : undefined}
              />
            </div>
          ))}
          {allPosts.map((post) => (
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
            <div key={`${post.slug}-card-a`} className="flex shrink-0 self-stretch">
              <PostListingCard
                post={post}
                anchorId={post.slug === "aigov" ? "aigov" : undefined}
                onPointerInsideCard={() => {
                  pausedRef.current = true;
                }}
              />
            </div>
          ))}

          {secondLoop.map((post) => (
            <div key={`${post.slug}-card-b`} className="flex shrink-0 self-stretch">
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