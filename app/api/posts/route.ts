// app/api/posts/route.ts
import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

export const dynamic = "force-dynamic";

type ResourceType =
  | "github" | "arxiv" | "wandb" | "mlflow" | "model" | "website"
  | "pdf" | "dataset" | "demo" | "colab" | "kaggle";

type Resource = { type: ResourceType; href: string; label?: string };

const ALLOWED: readonly ResourceType[] = [
  "github","arxiv","wandb","mlflow","model","website",
  "pdf","dataset","demo","colab","kaggle",
] as const;

function isResourceType(x: string): x is ResourceType {
  return (ALLOWED as readonly string[]).includes(x);
}

type ResourceCandidate = { type?: unknown; href?: unknown; label?: unknown };

function normalizeResources(input: unknown): Resource[] {
  const arr: unknown[] = Array.isArray(input) ? input : input != null ? [input] : [];
  return arr
    .map((it): Resource | null => {
      if (!it || typeof it !== "object") return null;
      const cand = it as ResourceCandidate;
      const typeStr = String(cand.type ?? "").toLowerCase();
      const hrefStr = String(cand.href ?? "");
      const labelStr = cand.label != null ? String(cand.label) : undefined;
      if (!hrefStr) return null;
      if (!isResourceType(typeStr)) return null;
      return { type: typeStr as ResourceType, href: hrefStr, label: labelStr };
    })
    .filter((r): r is Resource => r !== null);
}

function normalizeTags(input: unknown): string[] {
  if (Array.isArray(input)) return input.map(String);
  if (input == null) return [];
  return [String(input)];
}

function normalizeString(input: unknown, fallback = ""): string {
  return input != null ? String(input) : fallback;
}

// ---- date normalization: keep cards compact (YYYY-MM-DD) ----
function normalizeDate(input: unknown): string {
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input.toISOString().slice(0, 10);
  }
  if (typeof input === "string") {
    const s = input.trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    return s;
  }
  return "1970-01-01";
}

// ——— reading time helpers ———
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~\-`]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function countWords(md: string): number {
  const cleaned = stripMarkdown(md);
  return cleaned ? cleaned.split(" ").length : 0;
}
function readingMinutesFromContent(content: string, wpm = 200): number {
  return Math.max(1, Math.round(countWords(content) / wpm));
}

interface FrontMatter {
  title?: unknown;
  date?: unknown;
  tags?: unknown;
  tldr?: unknown;
  resources?: unknown;
  readingMinutes?: unknown;
}

interface PostMeta {
  slug: string;
  title: string;
  date: string;      // normalized YYYY-MM-DD
  tags: string[];
  tldr: string;
  resources: Resource[];
  readingMinutes: number;
}

export async function GET() {
  try {
    const postsDir = path.join(process.cwd(), "posts");
    const filenames = (await fs.readdir(postsDir)).filter((f) => /\.mdx?$/.test(f));

    const posts: PostMeta[] = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(postsDir, filename);
        const fileContent = await fs.readFile(filePath, "utf8");
        const fm = matter(fileContent);
        const data = fm.data as FrontMatter;

        const resources = normalizeResources(data.resources);
        const tags = normalizeTags(data.tags);
        const title = normalizeString(data.title, "Untitled");
        const date = normalizeDate(data.date);
        const tldr = normalizeString(data.tldr, "");
        const readingMinutes =
          typeof data.readingMinutes === "number"
            ? data.readingMinutes
            : readingMinutesFromContent(fm.content);

        return {
          slug: filename.replace(/\.mdx?$/, ""),
          title,
          date,
          tags,
          tldr,
          resources,
          readingMinutes,
        };
      })
    );

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error reading posts:", error);
    return NextResponse.json({ error: "Error reading posts" }, { status: 500 });
  }
}
