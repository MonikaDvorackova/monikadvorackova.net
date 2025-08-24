// app/blog/[slug]/page.tsx
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import React from "react";
import AnimatedBlogPost from "./AnimatedBlogPost";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// --- typy pro resources ---
export type ResourceType =
  | "github" | "arxiv" | "wandb" | "mlflow" | "model" | "website"
  | "pdf" | "dataset" | "demo" | "colab" | "kaggle";

export type Resource = { type: ResourceType; href: string; label?: string };

type BlogPostMeta = {
  title: string;
  date: string;
  tags: string[];
  tldr?: string;
  citations?: number;
  resources?: Resource[];
  readingTimeMin?: number;
};

const VALID_TYPES = [
  "github","arxiv","wandb","mlflow","model","website",
  "pdf","dataset","demo","colab","kaggle",
] as const satisfies readonly ResourceType[];

// --- IO helpers ---
async function readPostRaw(slug: string): Promise<string | null> {
  const postsDir = path.join(process.cwd(), "posts");
  for (const ext of [".mdx", ".md"] as const) {
    try {
      return await fs.readFile(path.join(postsDir, `${slug}${ext}`), "utf8");
    } catch { /* try next */ }
  }
  return null;
}

// --- parsing helpers ---
function isResourceType(x: unknown): x is ResourceType {
  return typeof x === "string" && (VALID_TYPES as readonly string[]).includes(x);
}

function parseResources(raw: unknown): Resource[] {
  const arr: unknown[] =
    Array.isArray(raw) ? raw
    : typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return []; } })()
    : [];
  return arr
    .map((r): Resource | null => {
      const t = (r as { type?: unknown })?.type;
      const href = (r as { href?: unknown })?.href;
      const label = (r as { label?: unknown })?.label;
      if (!isResourceType(t) || typeof href !== "string") return null;
      return { type: t, href, label: typeof label === "string" ? label : undefined };
    })
    .filter((x): x is Resource => Boolean(x));
}

function parseTags(raw: unknown): string[] {
  return Array.isArray(raw) ? (raw as unknown[]).map(String) : raw ? [String(raw)] : [];
}

function estimateReadingTimeMinutes(markdownContent: string): number {
  const words = markdownContent.replace(/[`*#>\-\[\]\(\)_]/g, " ")
    .split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// --- Metadata (pozor: params je Promise) ---
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const raw = await readPostRaw(slug);
  if (!raw) return { title: "Not found" };
  const { data } = matter(raw);
  const d = data as Record<string, unknown>;

  const title = String(d.title ?? "Untitled");
  const desc = d.tldr ? String(d.tldr) : undefined;
  const date = d.date ? String(d.date) : undefined;

  const urlBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";
  const canonical = urlBase ? `${urlBase}/blog/${slug}` : undefined;

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description: desc,
      url: canonical,
      locale: "en_US",
      siteName: "Monika Dvorackova",
      publishedTime: date,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

// --- Stránka (pozor: params je Promise) ---
export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const raw = await readPostRaw(slug);
  if (!raw) notFound();

  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

  const meta: BlogPostMeta = {
    title: String(d.title ?? "Untitled"),
    date: String(d.date ?? ""),
    tags: parseTags(d.tags),
    tldr: d.tldr ? String(d.tldr) : undefined,
    citations: typeof d.citations === "number" ? (d.citations as number) : undefined,
    resources: parseResources(d.resources),
    readingTimeMin: estimateReadingTimeMinutes(content),
  };

  return <AnimatedBlogPost meta={meta} content={content} />;
}
