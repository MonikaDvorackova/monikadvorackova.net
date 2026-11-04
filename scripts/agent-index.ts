import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { corpus, sha256 } from "../lib/agent/model";
import { embed, type EmbeddingIndex } from "../lib/agent/search";
async function main() {
  const docs = await corpus();
  const model = process.env.AGENT_EMBEDDING_MODEL || "text-embedding-3-small";
  let old: EmbeddingIndex | undefined;
  try {
    old = JSON.parse(await readFile("data/agent/embeddings.json", "utf8"));
  } catch {}
  const items: EmbeddingIndex["items"] = [];
  for (const doc of docs) {
    const cached =
      old?.model === model
        ? old.items.find((i) => i.id === doc.id && i.digest === doc.digest)
        : undefined;
    if (cached) {
      items.push(cached);
      continue;
    }
    const [vector] = await embed(
      [doc.title + "\n" + doc.description + "\n" + doc.body.slice(0, 12000)],
      model,
    );
    items.push({ id: doc.id, digest: doc.digest, vector });
  }
  const result: EmbeddingIndex = {
    version: 1,
    model,
    corpusDigest: sha256(docs.map((d) => [d.id, d.digest])),
    items,
  };
  await mkdir("data/agent", { recursive: true });
  await writeFile("data/agent/embeddings.json.tmp", JSON.stringify(result));
  await rename("data/agent/embeddings.json.tmp", "data/agent/embeddings.json");
  console.log("Indexed " + items.length + " public records");
}
main().catch(() => {
  console.error("Index failed; prior index retained.");
  process.exitCode = 1;
});
