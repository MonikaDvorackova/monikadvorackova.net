import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

export const dynamic = 'force-dynamic';

export async function GET() {
  const postsDir = path.join(process.cwd(), "posts");

  try {
    const filenames = (await fs.readdir(postsDir)).filter((f) => /\.mdx?$/.test(f));

    const posts = await Promise.all(
      filenames.map(async (filename) => {
        const file = await fs.readFile(path.join(postsDir, filename), "utf8");
        const { data } = matter(file);
        return {
          slug: filename.replace(/\.mdx?$/, ""),
          title: data.title || "Untitled",
          date: data.date || "1970-01-01",
        };
      })
    );

    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(posts);
  } catch (_) {
    return NextResponse.json({ error: "Error reading posts" }, { status: 500 });
  }
}

