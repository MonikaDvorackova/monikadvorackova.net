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

async function getPostRaw(slug: string) {
  const postsDir = path.join(process.cwd(), "posts");
  for (const ext of [".mdx", ".md"] as const) {
    try {
      const file = await fs.readFile(path.join(postsDir, `${slug}${ext}`), "utf8");
      return file;
    } catch {
      // continue
    }
  }
  return null;
}

const VALID_TYPES = [
  "github", "arxiv", "wandb", "mlflow", "model", "website",
  "pdf", "dataset", "demo", "colab", "kaggle",
] as const satisfies ResourceType[]; // pomůže TS inference

function isResourceType(x: unknown): x is ResourceType {
  return typeof x === "string" && (VALID_TYPES as readonly string[]).includes(x);
}

function parseResources(raw: unknown): Resource[] {
  // může přijít pole objektů, nebo JSON string
  const parsed =
    Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? (() => {
            try { return JSON.parse(raw); } catch { return []; }
          })()
        : [];

  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((r: any) => {
      const t = r?.type;
      const href = r?.href;
      const label = r?.label;
      if (!isResourceType(t) || typeof href !== "string") return null;
      return {
        type: t,
        href,
        label: typeof label === "string" ? label : undefined,
      } as Resource;
    })
    .filter(Boolean) as Resource[];
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
    : d.tags
      ? [String(d.tags)]
      : [];

  const meta: BlogPostMeta = {
    title: String(d.title ?? ""),
    date: String(d.date ?? ""),
    tags,
    tldr: d.tldr ? String(d.tldr) : undefined,
    citations: typeof d.citations === "number" ? (d.citations as number) : undefined,
    resources: parseResources(d.resources),
  };

  return <AnimatedBlogPost meta={meta} content={content} />;
}
