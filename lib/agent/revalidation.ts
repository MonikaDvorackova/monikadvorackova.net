import { corpus } from "./model";
import { transaction, appendEvent, putState } from "./store";
const allowed = new Set([
  "monikadvorackova.net",
  "github.com",
  "doi.org",
  "www.oreilly.com",
]);
export async function revalidateSources(fetcher: typeof fetch = fetch) {
  const results: {
    id: string;
    sourceUrl: string;
    status: "reachable" | "redirect_requires_review" | "unavailable";
    httpStatus: number | null;
    checkedAt: string;
    claimVerification: string;
  }[] = [];
  for (const doc of await corpus()) {
    const url = new URL(doc.source);
    if (
      url.protocol !== "https:" ||
      !allowed.has(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    )
      continue;
    let status: "reachable" | "redirect_requires_review" | "unavailable" =
      "unavailable";
    let httpStatus: number | null = null;
    try {
      const response = await fetcher(url, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      httpStatus = response.status;
      status = response.ok
        ? "reachable"
        : response.status >= 300 && response.status < 400
          ? "redirect_requires_review"
          : "unavailable";
    } catch {}
    results.push({
      id: doc.id,
      sourceUrl: doc.source,
      status,
      httpStatus,
      checkedAt: new Date().toISOString(),
      claimVerification:
        "unchanged; reachability does not independently verify claim",
    });
  }
  await transaction(async (client) => {
    await putState(client, "operations", "revalidation", results, 90);
    await appendEvent(client, {
      type: "evidence.revalidated",
      records: results.length,
      unavailable: results.filter((r) => r.status === "unavailable").length,
    });
  });
  return results;
}
