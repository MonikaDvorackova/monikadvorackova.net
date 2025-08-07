import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { Metadata } from "next";
import { ReactNode } from "react";

type LayoutProps = {
  params: { slug: string };
  children: ReactNode;
};

export async function generateMetadata(
  props: LayoutProps
): Promise<Metadata> {
  const slug = props.params.slug;

  const postsDir = path.join(process.cwd(), "posts");
  const mdPath = path.join(postsDir, `${slug}.md`);
  const mdxPath = path.join(postsDir, `${slug}.mdx`);
  let file: string;

  try {
    file = await fs.readFile(mdPath, "utf-8");
  } catch {
    file = await fs.readFile(mdxPath, "utf-8");
  }

  const { data } = matter(file);
  return { title: data.title || slug };
}

export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
