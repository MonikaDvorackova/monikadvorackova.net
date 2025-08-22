// app/blog/[slug]/page.tsx
import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import React from "react";
import AnimatedBlogPost from "./AnimatedBlogPost";
import type { Resource, ResourceType } from "@/components/ResourceIcons";

export const dynamic = "force-dynamic";

type BlogPostMeta = {
  title: string;
  date: string;
  tags: string[];
  tldr?: string;
  citations?: number;
  resources?: Resource[];
};

async function getPostRaw(slug: string): Promise<string | null> {
  const postsDir = path.join(process.cwd(), "posts");
  for (const ext of [".mdx", ".md"] as const) {
    try {
      const file = await fs.readFile(path.join(postsDir, `${slug}${ext}`), "utf8");
      return file;
    } catch {
      // try next extension
    }
  }
  return null;
}

const VALID_TYPES = [
  "github",
  "arxiv",
  "wandb",
  "mlflow",
  "model",
  "website",
  "pdf",
  "dataset",
  "demo",
  "colab",
  "kaggle",
] as const satisfies ResourceType[]; // helps TS inference

function isResourceType(x: unknown): x is ResourceType {
  return typeof x === "string" && (VALID_TYPES as readonly string[]).includes(x);
}

type ResourceCandidate = {
  type?: unknown;
  href?: unknown;
  label?: unknown;
};

function parseResources(raw: unknown): Resource[] {
  // Accepts array of objects or a JSON stringified array
  const parsed: unknown =
    Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? (() => {
            try {
              return JSON.parse(raw);
            } catch {
              return [];
            }
          })()
        : [];

  if (!Array.isArray(parsed)) return [];

  const out: Resource[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;

    const cand = item as ResourceCandidate;
    const typeStr =
      typeof cand.type === "string" ? cand.type.toLowerCase() : "";
    const hrefStr = typeof cand.href === "string" ? cand.href : "";
    const labelStr =
      typeof cand.label === "string" ? cand.label : undefined;

    if (!hrefStr) continue;
    if (!isResourceType(typeStr)) continue;

    out.push({
      type: typeStr as ResourceType,
      href: hrefStr,
      label: labelStr,
    });
  }
  return out;
}

export default async function BlogPostPage(
  props: { params: { slug: string } }
) {
  const { slug } = props.params;
  const raw = await getPostRaw(slug);
  if (!raw) notFound();

  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

  const tags: string[] = Array.isArray(d.tags)
    ? (d.tags as unknown[]).map(String)
    : d.tags != null
      ? [String(d.tags)]
      : [];

  const meta: BlogPostMeta = {
    title: String(d.title ?? ""),
    date: String(d.date ?? ""),
    tags,
    tldr: d.tldr != null ? String(d.tldr) : undefined,
    citations: typeof d.citations === "number" ? d.citations : undefined,
    resources: parseResources(d.resources),
  };

  return <AnimatedBlogPost meta={meta} content={content} />;
}
