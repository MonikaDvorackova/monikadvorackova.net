import { readFile } from "node:fs/promises";
import { type RecordData, sha256 } from "./model";
export const tokens = (value: string): string[] =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[\p{L}\p{N}]+/gu) || [];
const stop = new Set([
  "what",
  "is",
  "the",
  "a",
  "an",
  "of",
  "in",
  "on",
  "does",
  "has",
  "do",
  "and",
  "to",
  "who",
  "co",
  "je",
  "a",
  "v",
  "na",
  "jake",
  "ma",
  "kdo",
]);
export function lexical(docs: RecordData[], query: string) {
  const terms = [...new Set(tokens(query).filter((t) => !stop.has(t)))];
  const indexed = docs.map((doc) => {
    const words = tokens(doc.title + " " + doc.description + " " + doc.body);
    const frequencies = new Map<string, number>();
    for (const word of words)
      frequencies.set(word, (frequencies.get(word) || 0) + 1);
    return { doc, frequencies, title: new Set(tokens(doc.title)) };
  });
  const df = new Map(
    terms.map((term) => [
      term,
      indexed.filter((row) => row.frequencies.has(term)).length,
    ]),
  );
  return indexed
    .map(({ doc, frequencies, title }) => {
      let score = 0;
      for (const term of terms) {
        const count = frequencies.get(term) || 0;
        if (count)
          score +=
            (Math.log(1 + docs.length / (1 + (df.get(term) || 0))) * count) /
              (count + 1.2) +
            (title.has(term) ? 2 : 0);
      }
      return { ...doc, score };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export type EmbeddingIndex = {
  version: 1;
  model: string;
  corpusDigest: string;
  items: { id: string; digest: string; vector: number[] }[];
};
export function cosine(a: number[], b: number[]) {
  if (a.length !== b.length || !a.length) return 0;
  const norm = Math.sqrt(
    a.reduce((n, v) => n + v * v, 0) * b.reduce((n, v) => n + v * v, 0),
  );
  return norm ? a.reduce((n, v, i) => n + v * b[i], 0) / norm : 0;
}
export function fuse(groups: RecordData[][]) {
  const scores = new Map<string, { doc: RecordData; score: number }>();
  for (const group of groups)
    group.forEach((doc, i) => {
      const old = scores.get(doc.id);
      scores.set(doc.id, { doc, score: (old?.score || 0) + 1 / (61 + i) });
    });
  return [...scores.values()]
    .sort((a, b) => b.score - a.score || a.doc.id.localeCompare(b.doc.id))
    .map((x) => ({ ...x.doc, score: x.score }));
}
export async function embed(
  texts: string[],
  model = process.env.AGENT_EMBEDDING_MODEL || "text-embedding-3-small",
) {
  if (!process.env.AGENT_EMBEDDING_KEY)
    throw new Error("Embedding provider unavailable");
  // Fixed provider URL: request input cannot choose an SSRF destination.
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.AGENT_EMBEDDING_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: texts, model }),
    signal: AbortSignal.timeout(5000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Embedding request failed");
  const result = (await response.json()) as {
    data: { index: number; embedding: number[] }[];
  };
  const vectors = result.data
    .sort((a, b) => a.index - b.index)
    .map((v) => v.embedding);
  if (
    vectors.length !== texts.length ||
    vectors.some((v) => !v.length || !v.every(Number.isFinite))
  )
    throw new Error("Invalid embedding response");
  return vectors;
}
export async function search(docs: RecordData[], query: string, limit = 10) {
  const ranked = lexical(docs, query);
  let mode = "lexical";
  let results = ranked;
  if (process.env.AGENT_EMBEDDING_KEY)
    try {
      const index = JSON.parse(
        await readFile(
          "data/agent/embeddings." +
            (docs[0]?.language === "cs" ? "cs" : "en") +
            ".json",
          "utf8",
        ),
      ) as EmbeddingIndex;
      if (index.corpusDigest !== sha256(docs.map((d) => [d.id, d.digest])))
        throw new Error("Stale index");
      const [vector] = await embed([query], index.model);
      const byId = new Map(docs.map((d) => [d.id, d]));
      const semantic = index.items
        .filter((i) => byId.get(i.id)?.digest === i.digest)
        .map((i) => ({ doc: byId.get(i.id)!, score: cosine(vector, i.vector) }))
        .filter((x) => x.score > 0.2)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.doc);
      results = fuse([ranked, semantic]);
      mode = "hybrid-rrf";
    } catch {
      mode = "lexical-fallback";
    }
  return {
    mode,
    results: results.slice(0, limit).map(({ body, ...doc }) => ({
      ...doc,
      excerpt: body.replace(/<[^>]*>/g, "").slice(0, 1000),
    })),
  };
}
export async function ask(docs: RecordData[], question: string) {
  if (
    /ignore (all|previous)|system prompt|api.?key|password|salary|salar(y|ies)|private|tajne|heslo/i.test(
      question,
    )
  )
    return {
      answer: null,
      abstained: true,
      reason: "Question is outside public professional evidence.",
      citations: [],
    };
  const found = await search(docs, question, 5);
  const citations = found.results
    .filter(
      (r) =>
        r.kind !== "technology" &&
        !/(ignore|disregard).{0,50}(instruction|prompt)|system\s*prompt|reveal.{0,30}(secret|key|password)/i.test(
          r.title + " " + r.description,
        ),
    )
    .map((r) => ({
      id: r.id,
      url: r.source,
      title: r.title,
      status: r.status,
      digest: r.digest,
      quote: r.description,
    }));
  // Extractive QA: retrieved text is always data. It is never executed or used as model instructions.
  return {
    answer: citations.length ? citations.map((c) => c.quote).join("\n") : null,
    abstained: !citations.length,
    reason: citations.length
      ? "Extracted source descriptions; evidence status applies to each citation."
      : "Insufficient public evidence.",
    citations,
  };
}
