/** Deterministic public MDX catalog, regenerated before dev/build. Never hand-edit generated JSON. */
import { readdir, readFile, writeFile } from "node:fs/promises";
import matter from "gray-matter";
async function main() {
  const records = [];
  for (const [directory, kind] of [
    ["posts", "article"],
    ["content/projects", "project"],
  ] as const) {
    for (const file of (await readdir(directory))
      .filter((f) => /^[a-z0-9-]+\.mdx?$/.test(f))
      .sort()) {
      const { data, content } = matter(
        await readFile(directory + "/" + file, "utf8"),
      );
      records.push({
        kind,
        slug: file.replace(/\.mdx?$/, ""),
        title: String(data.title || file),
        description: String(
          data.description || data.tldr || data.title || file,
        ),
        body: content,
        topics: (Array.isArray(data.tags)
          ? data.tags
          : typeof data.tags === "string"
            ? data.tags.split(",")
            : []
        )
          .map((tag: unknown) => String(tag).trim())
          .filter(Boolean),
        language: data.language === "cs" ? "cs" : "en",
        updatedAt: data.date
          ? new Date(data.date).toISOString()
          : "2026-11-04T00:00:00.000Z",
      });
    }
  }
  await writeFile(
    "lib/agent/content.generated.json",
    JSON.stringify(records, null, 2) + "\n",
  );
}
main();
