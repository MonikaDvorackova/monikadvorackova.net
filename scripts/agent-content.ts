/** Deterministic public MDX catalog, regenerated before dev/build. Never hand-edit generated JSON. */
import { readdir, readFile, writeFile } from "node:fs/promises";
import matter from "gray-matter";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
async function main() {
  let previous: {
    slug: string;
    kind: string;
    sourceRevision?: string;
    updatedAt: string;
  }[] = [];
  try {
    previous = JSON.parse(
      await readFile("lib/agent/content.generated.json", "utf8"),
    );
  } catch {}
  const records = [];
  for (const [directory, kind] of [
    ["posts", "article"],
    ["content/projects", "project"],
  ] as const) {
    for (const file of (await readdir(directory))
      .filter((f) => /^[a-z0-9-]+\.mdx?$/.test(f))
      .sort()) {
      const filename = directory + "/" + file;
      const raw = await readFile(filename, "utf8");
      const { data, content } = matter(raw);
      if (
        data.draft === true ||
        data.visibility === "private" ||
        data.published === false
      )
        continue;
      const sourceRevision = createHash("sha256").update(raw).digest("hex");
      let changedAt: string | undefined;
      try {
        const date = execFileSync(
          "git",
          ["log", "-1", "--format=%cI", "--", filename],
          { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
        ).trim();
        if (date) changedAt = new Date(date).toISOString();
      } catch {}
      const old = previous.find(
        (record) =>
          record.kind === kind && record.slug === file.replace(/\.mdx?$/, ""),
      );
      const updatedAt =
        data.lastModified ||
        data.updatedAt ||
        (old?.sourceRevision === sourceRevision ? old.updatedAt : undefined) ||
        changedAt ||
        data.date ||
        "2026-11-04T00:00:00.000Z";
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
        sourceRevision,
        updatedAt: new Date(updatedAt).toISOString(),
      });
    }
  }
  await writeFile(
    "lib/agent/content.generated.json",
    JSON.stringify(records, null, 2) + "\n",
  );
}
main();
