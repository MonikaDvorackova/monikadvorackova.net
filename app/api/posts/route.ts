// app/api/posts/route.ts

import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const postsDir = path.join(process.cwd(), "posts");
    const filenames = (await fs.readdir(postsDir)).filter((f) => /\.mdx?$/.test(f));

    const posts = await Promise.all(
      filenames.map(async (filename) => {
        const filePath = path.join(postsDir, filename);
        const fileContent = await fs.readFile(filePath, "utf8");
        const { data } = matter(fileContent);

        return {
          slug: filename.replace(/\.mdx?$/, ""),
          title: data.title || "Untitled",
          date: data.date || "1970-01-01",
          tags: Array.isArray(data.tags)
            ? data.tags.map(String)
            : data.tags
            ? [String(data.tags)]
            : [],
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
