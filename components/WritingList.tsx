"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import CarouselEdgeFog from "@/components/CarouselEdgeFog";
import PostListingCard, { type ListingPost } from "@/components/PostListingCard";
import { useBlogCarouselMobileLayout } from "@/lib/blogCarouselMobileMedia";

function SpeakingCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <article className="flex h-full shrink-0 flex-col rounded-2xl border border-[#002aff]/[0.12] bg-white/75 text-black shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
      style={{ width: mobile ? "min(76vw, 288px)" : 420, minHeight: 200, padding: mobile ? "10px 12px 9px" : "12px 16px 10px", marginRight: mobile ? 0 : 16 }}>
      <div className="flex min-h-[56px] items-start justify-between gap-3">
        <h3 className="text-[11px] font-bold leading-snug">AI Assistants, RAG &amp; AI Agents</h3>
        <span className="shrink-0 text-right text-[9px]">27 Oct 2026</span>
      </div>
      <p className="mt-1 text-[9px] font-medium">FEMINNO AI Academy · Armenia · Online</p>
      <p className="mt-2 line-clamp-3 text-[9px] leading-[1.35]">Hands-on technical workshop on AI assistants, retrieval-augmented generation, agent workflows, evidence-grounded answers, and responsible AI.</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        {["Speaking", "RAG", "AI Agents"].map(tag => <span key={tag} className="rounded bg-[#004cff] px-2.5 py-1 text-[9px] font-semibold leading-none text-white">{tag}</span>)}
      </div>
    </article>
  );
}

export default function WritingList({ posts }: { posts: ListingPost[] }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);

  const isMobile = useBlogCarouselMobileLayout();

  const useMarquee = posts.length >= 1 && !isMobile;
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



  if (posts.length === 0) {\n    return <div className="flex w-full justify-center"><SpeakingCard mobile={isMobile} /></div>;\n  }\n\n  if (false && posts.length === 1) {
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
          <div className="flex shrink-0 self-stretch"><SpeakingCard /></div>\n          {secondLoop.map((post) => (
            <div key={`${post.slug}-writing-b`} className="flex shrink-0 self-stretch">
              <PostListingCard
                post={post}
                onPointerInsideCard={() => {
                  pausedRef.current = true;
                }}
              />
            </div>
          ))}
 \n          <div className="flex shrink-0 self-stretch"><SpeakingCard /></div>       </div>
      </div>
    </div>
  );
}