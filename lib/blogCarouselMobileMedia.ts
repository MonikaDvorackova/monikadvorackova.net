"use client";

import { useSyncExternalStore } from "react";

/** Portrait phones + phone landscape (wide CSS width). */
export const BLOG_CAROUSEL_MOBILE_QUERIES = [
  "(max-width: 639px)",
  "(max-width: 1024px) and (max-height: 500px) and (orientation: landscape)",
] as const;

export function getBlogCarouselMobileMatches(): boolean {
  if (typeof window === "undefined") return false;
  return BLOG_CAROUSEL_MOBILE_QUERIES.some((q) => window.matchMedia(q).matches);
}

function subscribeBlogCarouselMobile(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mqs = BLOG_CAROUSEL_MOBILE_QUERIES.map((q) => window.matchMedia(q));
  mqs.forEach((mq) => {
    mq.addEventListener("change", onChange);
  });
  return () => {
    mqs.forEach((mq) => {
      mq.removeEventListener("change", onChange);
    });
  };
}

/**
 * True when the blog carousel should use the mobile (CSS marquee) layout.
 * Uses useSyncExternalStore so the first client paint matches matchMedia immediately
 * (avoids a frame of desktop-only markup on phones).
 */
export function useBlogCarouselMobileLayout(): boolean {
  return useSyncExternalStore(
    subscribeBlogCarouselMobile,
    getBlogCarouselMobileMatches,
    () => false
  );
}
