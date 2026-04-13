"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import CarouselEdgeFog from "@/components/CarouselEdgeFog";
import { useMobileMarqueeAutoplay } from "@/components/useMobileMarqueeAutoplay";
import {
  BLOG_CAROUSEL_MOBILE_QUERIES,
  getBlogCarouselMobileMatches,
} from "@/lib/blogCarouselMobileMedia";

export type PublicationItem = {
  id: string;
  title: string;
  blurb: string;
  outlet: string;
  /** Optional; omit until a public URL exists. */
  href?: string;
  date?: string;
  /** Small line under the date (e.g. "Forthcoming", "External"). */
  caption?: string;
  tags?: string[];
  /** Line under the title (e.g. publisher · format). */
  subtitle?: string;
  /** Override; otherwise estimated from title + subtitle + blurb (~200 wpm). */
  readingMinutes?: number;
};

function estimateReadingMinutes(...parts: (string | undefined)[]): number {
  const text = parts.filter(Boolean).join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Curated external publications (not MDX posts). */
export const PUBLICATIONS_DATA: PublicationItem[] = [
  {
    id: "wk-ai-act-commentary",
    title: "EU AI Act Commentary - Expert Insight",
    subtitle: "Wolters Kluwer · Legal Blog · Expert insight",
    blurb:
      "EU AI Act commentary for Wolters Kluwer. A related book is in preparation (2026).",
    outlet: "Wolters Kluwer",
    date: "2026",
    caption: "Forthcoming",
    tags: ["AI Act"],
  },
];

function PublicationCard({
  item,
  solo = false,
  mobileSolo = false,
  onPointerInsideCard,
}: {
  item: PublicationItem;
  solo?: boolean;
  mobileSolo?: boolean;
  onPointerInsideCard?: () => void;
}) {
  const hasLink = Boolean(item.href?.trim());
  const readingMinutes =
    typeof item.readingMinutes === "number" && item.readingMinutes > 0
      ? item.readingMinutes
      : estimateReadingMinutes(item.title, item.subtitle, item.blurb);

  const cardStyle: CSSProperties = {
    width: solo ? (mobileSolo ? "min(76vw, 288px)" : "min(86vw, 360px)") : 420,
    minHeight: solo ? undefined : 96,
    marginRight: solo ? 0 : 16,
    backgroundColor: "rgba(255,255,255,0.72)",
    color: "#000",
    border: "1px solid rgba(0,42,255,0.12)",
    boxShadow: "inset 0 0 0 1px rgba(8,28,244,0.06), 0 4px 16px rgba(0,0,0,0.07)",
    padding:
      solo && mobileSolo ? "10px 12px 9px" : solo ? "16px 16px 14px" : "12px 16px 10px",
    backdropFilter: "blur(8px)",
    borderRadius: "1rem",
    contain: "layout paint",
    flexShrink: 0,
  };

  const inner = (
    <>
      <div className="flex h-full flex-col">
        <div
          className={`flex items-start justify-between gap-2 sm:gap-3${mobileSolo && solo ? " min-h-[48px]" : " min-h-[56px]"}`}
        >
          <div className="min-w-0 flex-1 self-start">
            <div className="flex items-start gap-2">
              <div
                className={`line-clamp-3 font-bold leading-snug text-black transition-colors group-hover:text-neutral-800${mobileSolo && solo ? " text-[10px]" : " text-[11px]"}`}
                title={item.title}
              >
                {item.title}
              </div>
              {hasLink ? (
                <FaExternalLinkAlt
                  className="mt-0.5 h-3 w-3 shrink-0 text-black transition-colors group-hover:text-[#004cff]"
                  aria-hidden
                />
              ) : null}
            </div>
            {item.subtitle ? (
              <p
                className={`mt-1 leading-snug text-black${mobileSolo && solo ? " text-[8px]" : " text-[9px]"}`}
              >
                {item.subtitle}
              </p>
            ) : null}
          </div>

          <div
            className={`flex shrink-0 flex-col items-end justify-start gap-0.5 text-right${mobileSolo && solo ? " min-h-[48px]" : " min-h-[56px]"}`}
          >
            {item.date ? (
              <div
                className={`font-medium tabular-nums text-black${mobileSolo && solo ? " text-[8px]" : " text-[9px]"}`}
              >
                {item.date}
              </div>
            ) : null}
            <div
              className={`font-medium${mobileSolo && solo ? " text-[8px]" : " text-[9px]"}`}
              style={
                (item.caption ?? "").toLowerCase() === "forthcoming"
                  ? {
                      color: "#dc2626",
                      WebkitTextFillColor: "#dc2626",
                    }
                  : { color: "#000", WebkitTextFillColor: "#000" }
              }
            >
              {item.caption ?? "External"}
            </div>
            <div
              className={`mb-0.5 tabular-nums text-black leading-tight${mobileSolo && solo ? " text-[8px]" : " text-[9px]"}`}
            >
              {readingMinutes} min
            </div>
            <div className="mt-1 min-h-[15px] w-full shrink-0" aria-hidden />
          </div>
        </div>

        <p
          className={`mt-2 line-clamp-3 leading-[1.35] text-black${mobileSolo && solo ? " text-[8px]" : " text-[9px]"}`}
        >
          {item.blurb}
        </p>

        <div className={`mt-auto${mobileSolo && solo ? " pt-2" : " pt-3"}`}>
          <div className="flex flex-wrap gap-x-[10px] gap-y-2">
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center whitespace-nowrap rounded font-semibold leading-none${mobileSolo && solo ? " px-2 py-0.5 text-[8px]" : " px-2.5 py-1 text-[9px]"}`}
                style={{
                  backgroundColor: "#004cff",
                  color: "#fff",
                  WebkitTextFillColor: "#fff",
                }}
              >
                {tag}
              </span>
            ))}
            <span
              className={`inline-flex items-center whitespace-nowrap rounded font-semibold leading-none${mobileSolo && solo ? " px-2 py-0.5 text-[8px]" : " px-2.5 py-1 text-[9px]"}`}
              style={{
                backgroundColor: "#004cff",
                color: "#fff",
                WebkitTextFillColor: "#fff",
              }}
            >
              {item.outlet}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const cardHoverClass =
    "group relative block rounded-2xl overflow-visible transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004cff]/50";

  if (hasLink) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.title}${item.subtitle ? `. ${item.subtitle}` : ""}. Opens in a new tab.`}
        className={`${cardHoverClass} cursor-pointer`}
        style={cardStyle}
        onPointerEnter={onPointerInsideCard}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={`${cardHoverClass} cursor-default`} style={cardStyle} onPointerEnter={onPointerInsideCard}>
      {inner}
    </div>
  );
}

export default function PublicationsList() {
  const items = PUBLICATIONS_DATA;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqs = BLOG_CAROUSEL_MOBILE_QUERIES.map((q) => window.matchMedia(q));
    const update = () => setIsMobile(getBlogCarouselMobileMatches());
    update();
    mqs.forEach((mq) => {
      if (mq.addEventListener) mq.addEventListener("change", update);
      else mq.addListener(update);
    });
    return () => {
      mqs.forEach((mq) => {
        if (mq.removeEventListener) mq.removeEventListener("change", update);
        else mq.removeListener(update);
      });
    };
  }, []);

  const useMarquee = items.length >= 2 && !isMobile;
  const firstLoop = items;
  const secondLoop = items;
  const mobileContentKey = items.map((i) => i.id).join("|");

  useMobileMarqueeAutoplay(mobileScrollerRef, isMobile && items.length >= 2, mobileContentKey, {
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
    const speedDesktop = 18;
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
  }, [useMarquee, items.length]);

  if (!items.length) return null;

  if (items.length === 1) {
    return (
      <div className="w-full flex justify-center">
        <PublicationCard item={items[0]} solo mobileSolo={isMobile} />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        ref={mobileScrollerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden overscroll-x-contain no-scrollbar select-none"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingLeft: 6,
          paddingRight: 6,
        }}
      >
        <CarouselEdgeFog />
        <div
          data-marquee-track
          className="relative z-0 flex w-max gap-2 py-0.5 px-0.5"
        >
          {items.map((item) => (
            <div key={`${item.id}-a`} className="shrink-0">
              <PublicationCard item={item} solo mobileSolo={isMobile} />
            </div>
          ))}
          {items.map((item) => (
            <div key={`${item.id}-b`} className="shrink-0">
              <PublicationCard item={item} solo mobileSolo={isMobile} />
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
        className="relative w-full cursor-default overflow-hidden select-none"
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
          className="relative z-0 flex w-max will-change-transform pl-1 pr-1"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          {firstLoop.map((item) => (
            <PublicationCard
              key={`${item.id}-pub-a`}
              item={item}
              onPointerInsideCard={() => {
                pausedRef.current = true;
              }}
            />
          ))}
          {secondLoop.map((item) => (
            <PublicationCard
              key={`${item.id}-pub-b`}
              item={item}
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
