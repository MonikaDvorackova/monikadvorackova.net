/** Portrait phones + phone landscape (wide CSS width); desktop layout unchanged above ~640px except short landscape). */
export const BLOG_CAROUSEL_MOBILE_QUERIES = [
  "(max-width: 639px)",
  "(max-width: 1024px) and (max-height: 500px) and (orientation: landscape)",
] as const;

export function getBlogCarouselMobileMatches(): boolean {
  if (typeof window === "undefined") return false;
  return BLOG_CAROUSEL_MOBILE_QUERIES.some((q) => window.matchMedia(q).matches);
}
