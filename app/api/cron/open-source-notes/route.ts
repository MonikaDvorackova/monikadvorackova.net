import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const OWNER = "MonikaDvorackova";
const REPO = "monikadvorackova.net";
const API = "https://api.github.com";
const excludedOwners = new Set(["monikadvorackova", "aigovdev", "aimlgov"]);

async function github(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

type PR = { title: string; html_url: string; number: number; repository_url: string };
function previousMonth(now: Date) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1,
    start: date.toISOString().slice(0, 10), end: next.toISOString().slice(0, 10) };
}
function article(year: number, month: number, prs: PR[]) {
  const label = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  const date = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  const lines = [
    "---", `title: "Open Source Engineering Notes — ${label}"`,
    `date: "${date}"`, 'type: "article"',
    'tags: ["Open Source", "Engineering"]',
    `description: "A source-linked record of upstream contributions merged in ${label}."`,
    "---", "", `This is a reviewable record of external upstream pull requests merged in ${label}.`, "",
    `## Merged upstream contributions (${prs.length})`, "",
  ];
  if (!prs.length) lines.push("No external merged pull requests were found for this month.", "");
  for (const pr of prs) {
    const repo = pr.repository_url.split("/repos/")[1];
    lines.push(`### ${repo} — PR #${pr.number}`, "",
      `[${pr.title.replace(/[\[\]]/g, "")}](${pr.html_url})`, "",
      "Editorial review required: inspect the diff, tests and maintainer feedback before describing technical impact.", "");
  }
  lines.push("## Editorial review", "",
    "Verify each linked pull request and replace editorial placeholders before publishing. This draft is not an assessment of downstream adoption or impact.", "");
  return lines.join("\n");
}
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const token = process.env.OSS_GITHUB_TOKEN;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!token) return NextResponse.json({ error: "OSS_GITHUB_TOKEN not configured" }, { status: 503 });
  try {
    const { year, month, start, end } = previousMonth(new Date());
    const slug = `open-source-engineering-notes-${year}-${String(month).padStart(2, "0")}`;
    const filePath = `posts/${slug}.mdx`;
    const q = `type:pr author:${OWNER} is:merged merged:>=${start} merged:<${end}`;
    const prs: PR[] = [];
    for (let page = 1; page <= 10; page++) {
      const result = await github(`/search/issues?${new URLSearchParams({ q, per_page: "100", page: String(page) })}`, token) as { items: PR[] };
      for (const pr of result.items) {
        const owner = pr.repository_url.split("/repos/")[1]?.split("/")[0]?.toLowerCase();
        if (owner && !excludedOwners.has(owner)) prs.push(pr);
      }
      if (result.items.length < 100) break;
    }
    prs.sort((a, b) => a.repository_url.localeCompare(b.repository_url) || a.number - b.number);
    const branch = `automation/oss-notes-${year}-${String(month).padStart(2, "0")}`;
    const existing = await fetch(`${API}/repos/${OWNER}/${REPO}/git/ref/heads/${encodeURIComponent(branch)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }, cache: "no-store",
    });
    if (existing.ok) return NextResponse.json({ status: "already-created", branch });
    if (existing.status !== 404) throw new Error(`Checking branch failed: ${existing.status}`);
    const main = await github(`/repos/${OWNER}/${REPO}/git/ref/heads/main`, token) as { object: { sha: string } };
    await github(`/repos/${OWNER}/${REPO}/git/refs`, token, {
      method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: main.object.sha }),
    });
    await github(`/repos/${OWNER}/${REPO}/contents/${filePath}`, token, {
      method: "PUT", body: JSON.stringify({
        message: `docs: draft ${slug}`, content: Buffer.from(article(year, month, prs)).toString("base64"), branch,
      }),
    });
    const pr = await github(`/repos/${OWNER}/${REPO}/pulls`, token, {
      method: "POST", body: JSON.stringify({
        title: `docs: review open-source notes for ${year}-${String(month).padStart(2, "0")}`,
        head: branch, base: "main",
        body: "Automatically generated from merged upstream PR records. Review each diff and replace editorial placeholders before merging.",
      }),
    }) as { html_url: string };
    return NextResponse.json({ status: "created", pull_request: pr.html_url, count: prs.length });
  } catch (error) {
    console.error("Monthly open-source notes cron failed", error);
    return NextResponse.json({ error: "Monthly draft creation failed" }, { status: 500 });
  }
}
