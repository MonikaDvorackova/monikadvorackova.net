"use client";

import Link from "next/link";
import ResourceIcons, { type Resource as ResourceItem } from "@/components/ResourceIcons";

/** Matches the historical listing pattern (~3–5 tags); avoids multi-row tag walls. */
const MAX_TAGS_ON_CARD = 5;

/** ~3 lines at text-[9px] leading-[1.5] (9 × 1.5 × 3 ≈ 40.5px). */
const DESCRIPTION_SLOT_MIN_PX = 42;

/** Title row + description slot + single tag strip + padding (non-solo). */
const CARD_BODY_MIN_PX = 176;

export type ListingPost = {
  title: string;
  cardTitle?: string;
  date: string;
  slug: string;
  tags: string[];
  tldr?: string;
  description?: string;
  readingMinutes?: number;
  resources?: ResourceItem[];
};

function listingSummary(post: ListingPost): string | undefined {
  const d = post.description?.trim();
  const t = post.tldr?.trim();
  if (d) return d;
  if (t) return t;
  return undefined;
}

export default function PostListingCard({
  post,
  solo = false,
  mobileSolo = false,
  onPointerInsideCard,
}: {
  post: ListingPost;
  solo?: boolean;
  mobileSolo?: boolean;
  onPointerInsideCard?: () => void;
}) {
  const href = `/blog/${post.slug}`;
  const displayTitle = (post.cardTitle?.trim() || post.title).trim();
  const summary = listingSummary(post);
  const visibleTags = (post.tags ?? []).slice(0, MAX_TAGS_ON_CARD);

  return (
    <div
      className="group relative flex min-h-0 flex-col overflow-visible rounded-2xl transition-transform duration-300 hover:scale-[1.01] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)] focus-within:ring-2 focus-within:ring-[#004cff]/50"
      onPointerEnter={onPointerInsideCard}
      style={{
        width: solo ? (mobileSolo ? "min(84vw, 360px)" : "min(86vw, 360px)") : 420,
        minHeight: solo ? undefined : CARD_BODY_MIN_PX,
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
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-[56px] shrink-0 items-start justify-between gap-3">
          <Link
            href={href}
            className="min-w-0 flex-1 self-start line-clamp-2 text-[11px] font-semibold leading-snug text-[#004cff] transition-opacity group-hover:opacity-90 sm:text-[11px]"
            title={post.title}
            aria-label={`Open: ${post.title}`}
          >
            {displayTitle}
          </Link>

          <div className="flex min-h-[56px] shrink-0 max-w-[40%] flex-col items-end justify-start gap-1 text-right">
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

        <div
          className="mt-2 min-h-0 shrink-0"
          style={{ minHeight: DESCRIPTION_SLOT_MIN_PX }}
        >
          {summary ? (
            <Link
              href={href}
              className="block h-full min-h-0 text-black no-underline visited:text-black hover:text-black focus-visible:text-black"
              style={{ color: "#000" }}
            >
              <p
                className="line-clamp-3 text-[9px] leading-[1.5] sm:text-[9px]"
                style={{ color: "#000", WebkitTextFillColor: "#000" }}
              >
                {summary}
              </p>
            </Link>
          ) : null}
        </div>

        <div className="mt-auto min-h-0 shrink-0 pt-3">
          {visibleTags.length ? (
            <div
              className="flex min-h-[24px] flex-nowrap items-center gap-x-[10px] overflow-x-auto overflow-y-hidden no-scrollbar"
              aria-label="Post tags"
            >
              {visibleTags.map((tag, i) => (
                <Link
                  key={`${post.slug}-${tag}-${i}`}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  aria-label={`Tag: ${tag}`}
                  className="inline-flex shrink-0 items-center rounded px-2.5 py-1 text-[9px] font-semibold leading-none whitespace-nowrap"
                  style={{
                    backgroundColor: "#004cff",
                    color: "#fff",
                    WebkitTextFillColor: "#fff",
                  }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : (
            <div className="min-h-[24px]" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}
