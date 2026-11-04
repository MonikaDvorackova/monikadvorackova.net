import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { syncGitHub } from "../lib/agent/github";
import type { RecordData } from "../lib/agent/model";
async function main() {
  let previous: RecordData[] = [];
  try {
    previous = JSON.parse(await readFile("data/agent/github.json", "utf8"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  const result = await syncGitHub(previous);
  await mkdir("data/agent", { recursive: true });
  await writeFile(
    "data/agent/github.json.tmp",
    JSON.stringify(result.records, null, 2) + "\n",
  );
  await rename("data/agent/github.json.tmp", "data/agent/github.json");
  await writeFile(
    "data/agent/sync-status.json",
    JSON.stringify(result.status, null, 2) + "\n",
  );
  console.log(JSON.stringify(result.status));
}
main().catch((error: unknown) => {
  console.error(
    "GitHub sync failed; existing snapshot preserved. " +
      (error instanceof Error ? error.message : "unknown error"),
  );
  process.exitCode = 1;
});
