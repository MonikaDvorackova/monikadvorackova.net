import { record, BASE, type RecordData } from "./model";
export type GitHubFetch = typeof fetch;
export async function github(
  path: string,
  token: string | undefined,
  fetcher: GitHubFetch = fetch,
): Promise<unknown> {
  if (!path.startsWith("/") || path.startsWith("//"))
    throw new Error("Invalid GitHub path");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetcher("https://api.github.com" + path, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok) return response.json();
    if (response.status === 403 || response.status === 429) {
      const reset =
        Number(response.headers.get("x-ratelimit-reset") || 0) * 1000;
      const retry = Number(response.headers.get("retry-after") || 0) * 1000;
      const delay = Math.max(retry, reset - Date.now());
      if (delay > 2000)
        throw new Error("GitHub rate limit; retry at next scheduled run");
    }
    if (
      response.status < 500 &&
      response.status !== 429 &&
      response.status !== 403
    )
      throw new Error("GitHub request rejected: " + response.status);
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(1000, 100 * 2 ** attempt)),
    );
  }
  throw new Error("GitHub retries exhausted");
}
interface Repository {
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  default_branch: string;
}
interface Pull {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  merged_at: string | null;
  updated_at: string;
  head: { sha: string };
  base: { repo: Repository };
  body?: string | null;
}
export function contribution(pr: Pull): RecordData | null {
  if (
    pr.base.repo.private ||
    /(?:secret|credential|2fa|reset|backup|incident)/i.test(
      pr.base.repo.full_name,
    ) ||
    !pr.html_url.startsWith("https://github.com/")
  )
    return null;
  const status = pr.merged_at
    ? "merged"
    : pr.state === "closed"
      ? "closed"
      : "opened";
  return record({
    id: pr.html_url,
    kind: "contribution",
    title: pr.title,
    description: `${pr.base.repo.full_name} #${pr.number}: ${status}.`,
    body: `Pull request status: ${status}. Commit: ${pr.head.sha}.`,
    url: pr.html_url,
    language: "en",
    status: "source_verified",
    verifiedAt: new Date().toISOString(),
    updatedAt: pr.updated_at,
    relations: [
      { type: "contributor", target: BASE + "/#person" },
      { type: "contributesTo", target: pr.base.repo.html_url },
    ],
    source: pr.html_url,
    sourceRevision: pr.head.sha,
  });
}
export async function syncGitHub(
  previous: RecordData[] = [],
  token = process.env.AGENT_GITHUB_TOKEN,
  fetcher: GitHubFetch = fetch,
) {
  const now = new Date().toISOString();
  const map = new Map<string, RecordData>();
  const get = (p: string) => github(p, token, fetcher);
  for (let page = 1; page <= 20; page++) {
    const repos = (await get(
      "/users/MonikaDvorackova/repos?type=owner&per_page=100&page=" + page,
    )) as Repository[];
    for (const repo of repos.filter(
      (r) =>
        !r.private &&
        !/(?:secret|credential|2fa|reset|backup|incident)/i.test(r.full_name),
    )) {
      map.set(
        repo.html_url,
        record({
          id: repo.html_url,
          kind: "repository",
          title: repo.full_name,
          description: repo.description || repo.full_name,
          body: repo.description || repo.full_name,
          url: repo.html_url,
          source: repo.html_url,
          language: "en",
          status: "source_verified",
          verifiedAt: new Date().toISOString(),
          updatedAt: repo.updated_at,
          relations: [{ type: "owner", target: BASE + "/#person" }],
        }),
      );
      // Only query releases of repositories which changed since the previous snapshot.
      if (
        previous.find((d) => d.id === repo.html_url)?.updatedAt ===
        repo.updated_at
      ) {
        for (const old of previous.filter(
          (d) =>
            d.kind === "release" &&
            d.relations.some((r) => r.target === repo.html_url),
        ))
          map.set(old.id, old);
        continue;
      }
      const releases = (await get(
        "/repos/" + repo.full_name + "/releases?per_page=100",
      )) as {
        id: number;
        html_url: string;
        name: string;
        tag_name: string;
        published_at: string;
        draft: boolean;
        target_commitish: string;
      }[];
      for (const release of releases.filter((r) => !r.draft && r.published_at))
        map.set(
          release.html_url,
          record({
            id: release.html_url,
            kind: "release",
            title: release.name || release.tag_name,
            description: repo.full_name + " release " + release.tag_name,
            body: release.tag_name,
            url: release.html_url,
            source: release.html_url,
            sourceRevision: release.target_commitish,
            language: "en",
            status: "source_verified",
            verifiedAt: new Date().toISOString(),
            updatedAt: release.published_at,
            relations: [{ type: "releaseOf", target: repo.html_url }],
          }),
        );
    }
    if (repos.length < 100) break;
  }
  // Recheck every returned PR: search result state alone never establishes merged status.
  for (let page = 1; page <= 10; page++) {
    const result = (await get(
      "/search/issues?" +
        new URLSearchParams({
          q: "type:pr author:MonikaDvorackova is:public",
          per_page: "100",
          page: String(page),
          sort: "updated",
          order: "desc",
        }),
    )) as {
      items: { pull_request: { url: string } }[];
      incomplete_results: boolean;
      total_count: number;
    };
    if (result.incomplete_results || result.total_count > 1000)
      throw new Error(
        "GitHub search incomplete; refusing partial authoritative snapshot",
      );
    for (const item of result.items) {
      const url = new URL(item.pull_request.url);
      if (
        url.origin !== "https://api.github.com" ||
        !/^\/repos\/[\w.-]+\/[\w.-]+\/pulls\/\d+$/.test(url.pathname)
      )
        continue;
      const pr = (await get(url.pathname)) as Pull;
      const doc = contribution(pr);
      if (doc) {
        map.set(doc.id, doc);
        const repo = pr.base.repo;
        if (!map.has(repo.html_url))
          map.set(
            repo.html_url,
            record({
              id: repo.html_url,
              kind: "repository",
              title: repo.full_name,
              description: repo.description || repo.full_name,
              body: repo.description || repo.full_name,
              url: repo.html_url,
              source: repo.html_url,
              language: "en",
              status: "source_verified",
              verifiedAt: now,
              updatedAt: repo.updated_at,
              relations: [],
            }),
          );
      } else map.delete(pr.html_url);
    }
    if (result.items.length < 100) break;
  }
  return {
    records: [...map.values()].sort((a, b) => a.id.localeCompare(b.id)),
    status: { lastSuccess: now, count: map.size },
  };
}
