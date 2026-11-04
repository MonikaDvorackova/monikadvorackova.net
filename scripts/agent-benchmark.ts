import { corpus } from "../lib/agent/model";
import { search, ask } from "../lib/agent/search";
import { writeFile, mkdir } from "node:fs/promises";
async function main() {
  const docs = await corpus();
  const samples: Record<
    string,
    { p50Ms: number; p95Ms: number; runs: number }
  > = {};
  for (const [name, fn] of Object.entries({
    corpus: () => corpus(),
    search: () => search(docs, "AIGov MLOps", 10),
    ask: () => ask(docs, "What is AIGov?"),
  })) {
    const times = [];
    for (let i = 0; i < 30; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    samples[name] = {
      p50Ms: +times[15].toFixed(2),
      p95Ms: +times[28].toFixed(2),
      runs: times.length,
    };
  }
  await mkdir("docs/agent", { recursive: true });
  await writeFile(
    "docs/agent/benchmarks.json",
    JSON.stringify(
      {
        runtime: process.version,
        records: docs.length,
        mode: "local lexical, warm process; no HTTP or embedding latency",
        samples,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify(samples));
}
main();
