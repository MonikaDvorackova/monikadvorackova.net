"use client";

import Link from "next/link";
import ResourceIcons, { type Resource as ResourceItem } from "@/components/ResourceIcons";

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
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex min-h-[56px] items-start justify-between gap-3">
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

        {summary ? (
          <Link
            href={href}
            className="mt-2 block min-h-0 text-black no-underline visited:text-black hover:text-black focus-visible:text-black"
            style={{ color: "#000" }}
          >
            <p
              className="line-clamp-3 text-[9px] leading-[1.5] sm:text-[9px]"
              style={{ color: "#000", WebkitTextFillColor: "#000" }}
            >
              {summary}
            </p>
          </Link>
        ) : (
          <div className="mt-2" />
        )}

        <div className="mt-auto min-h-0 pt-3">
          {post.tags?.length ? (
            <div className="flex flex-wrap justify-start gap-x-[10px] gap-y-2">
              {post.tags.map((tag, i) => (
                <Link
                  key={`${post.slug}-${tag}-${i}`}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  aria-label={`Tag: ${tag}`}
                  className="inline-flex max-w-full min-w-0 items-center rounded px-2.5 py-1 text-[9px] font-semibold leading-none whitespace-nowrap"
                  style={{
                    backgroundColor: "#004cff",
                    color: "#fff",
                    WebkitTextFillColor: "#fff",
                  }}
                >
                  <span className="truncate">{tag}</span>
                </Link>
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
