import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { corpus, sha256, type Language } from "../lib/agent/model";
import { embed, type EmbeddingIndex } from "../lib/agent/search";
async function main() {
  if (
    !process.env.AGENT_EMBEDDING_KEY &&
    process.argv.includes("--if-configured")
  ) {
    console.log(
      "Embeddings unavailable: deterministic lexical retrieval remains enabled.",
    );
    return;
  }
  const model = process.env.AGENT_EMBEDDING_MODEL || "text-embedding-3-small";
  await mkdir("data/agent", { recursive: true });
  for (const lang of ["en", "cs"] as Language[]) {
    const docs = await corpus(lang);
    const filename = "data/agent/embeddings." + lang + ".json";
    let old: EmbeddingIndex | undefined;
    try {
      old = JSON.parse(await readFile(filename, "utf8"));
    } catch {}
    const cached = new Map(
      old?.model === model ? old.items.map((i) => [i.id, i]) : [],
    );
    const vectors = new Map<string, number[]>();
    const changed = docs.filter((d) => cached.get(d.id)?.digest !== d.digest);
    for (let n = 0; n < changed.length; n += 16) {
      const batch = changed.slice(n, n + 16);
      const embeddings = await embed(
        batch.map(
          (doc) =>
            doc.title +
            "\n" +
            doc.description +
            "\n" +
            doc.body.slice(0, 12000),
        ),
        model,
      );
      batch.forEach((doc, i) => vectors.set(doc.id, embeddings[i]));
    }
    const items = docs.map((doc) => ({
      id: doc.id,
      digest: doc.digest,
      vector: vectors.get(doc.id) || cached.get(doc.id)!.vector,
    }));
    const result: EmbeddingIndex = {
      version: 1,
      model,
      corpusDigest: sha256(docs.map((d) => [d.id, d.digest])),
      items,
    };
    await writeFile(filename + ".tmp", JSON.stringify(result));
    await rename(filename + ".tmp", filename);
    console.log(
      "Indexed " +
        items.length +
        " public records (" +
        lang +
        "), " +
        changed.length +
        " changed.",
    );
  }
}
main().catch(() => {
  console.error("Index failed; prior index retained.");
  process.exitCode = 1;
});
