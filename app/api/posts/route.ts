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
  "github","arxiv","wandb","mlflow","model","website","pdf","dataset","demo","colab","kaggle",
] as const;

function normalizeResources(input: unknown): Resource[] {
  const arr = Array.isArray(input) ? input : (input ? [input] : []);
  return arr
    .map((it: any) => ({
      type: String(it?.type || "").toLowerCase() as ResourceType,
      href: String(it?.href || ""),
      label: it?.label ? String(it.label) : undefined,
    }))
    .filter(r => r.href && (ALLOWED as readonly string[]).includes(r.type));
}

export async function GET() {
  try {
    const postsDir = path.join(process.cwd(), "posts");
    const filenames = (await fs.readdir(postsDir)).filter((f) => /\.mdx?$/.test(f));

    const posts = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(postsDir, filename);
        const fileContent = await fs.readFile(filePath, "utf8");
        const { data } = matter(fileContent);

        const resources = normalizeResources((data as any).resources);
        const tags = Array.isArray((data as any).tags)
          ? (data as any).tags.map(String)
          : (data as any).tags
          ? [String((data as any).tags)]
          : [];

        return {
          slug: filename.replace(/\.mdx?$/, ""),
          title: (data as any).title || "Untitled",
          date: (data as any).date || "1970-01-01",
          tags,
          tldr: (data as any).tldr ?? "",
          resources,
        };
      })
    );

    posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error reading posts:", error);
    return NextResponse.json({ error: "Error reading posts" }, { status: 500 });
  }
}
