// app/sitemap.ts
import type { MetadataRoute } from "next";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

const BASE =
  (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://example.com");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  const staticPaths = ["/", "/blog"];
  for (const p of staticPaths) {
    urls.push({
      url: `${BASE}${p}`,
      changeFrequency: "weekly",
      priority: p === "/" ? 1 : 0.7,
      lastModified: new Date(),
    });
  }

  // blog posty
  const postsDir = path.join(process.cwd(), "posts");
  let files: string[] = [];
  try {
    files = (await fs.readdir(postsDir)).filter((f) => /\.mdx?$/.test(f));
  } catch {
    // žádné posty – nevadí
  }

  for (const file of files) {
    const full = path.join(postsDir, file);
    const raw = await fs.readFile(full, "utf8");
    const fm = matter(raw);
    const stat = await fs.stat(full);

    const slug = file.replace(/\.mdx?$/, "");
    const dateStr = typeof fm.data?.date === "string" ? fm.data.date : undefined;

    urls.push({
      url: `${BASE}/blog/${slug}`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: dateStr ? new Date(dateStr) : stat.mtime,
    });
  }

  return urls;
}
