import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { PUBLICATIONS_DATA } from "../publications";
import { STACK_GROUPS } from "../stack";

export const BASE = "https://monikadvorackova.net";
export const VERSION = "1.0.0";
export type Language = "en" | "cs";
export type Kind =
  | "person"
  | "project"
  | "publication"
  | "article"
  | "skill"
  | "technology"
  | "organization"
  | "experience"
  | "education"
  | "contribution"
  | "repository"
  | "release"
  | "issue";
export type RecordData = {
  id: string;
  kind: Kind;
  title: string;
  description: string;
  body: string;
  url: string;
  language: Language;
  status: "self_reported" | "source_verified";
  updatedAt: string;
  relations: { type: string; target: string }[];
  source: string;
  sourceRevision?: string;
  digest: string;
};
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b, "en"))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
export const sha256 = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");
export function record(input: Omit<RecordData, "digest">): RecordData {
  return { ...input, digest: sha256(input) };
}
export function verifyRecord(input: RecordData) {
  const { digest, ...payload } = input;
  return digest === sha256(payload);
}
export const personId = BASE + "/#person";
const snapshotDate = "2026-11-04T00:00:00.000Z";
const descriptions = {
  en: "AI/ML engineer and consultant specializing in NLP, MLOps and AI governance.",
  cs: "AI/ML inženýrka a konzultantka se zaměřením na NLP, MLOps a správu AI.",
};
export async function corpus(lang: Language = "en"): Promise<RecordData[]> {
  const common = {
    language: lang,
    status: "self_reported" as const,
    updatedAt: snapshotDate,
    relations: [],
    source: BASE,
  };
  const docs: RecordData[] = [
    record({
      ...common,
      id: personId,
      kind: "person",
      title: "Monika Dvořáčková",
      description: descriptions[lang],
      body: descriptions[lang],
      url: BASE,
    }),
  ];
  for (const group of STACK_GROUPS)
    for (const title of group.items)
      docs.push(
        record({
          ...common,
          id: BASE + "/#technology-" + encodeURIComponent(title.toLowerCase()),
          kind: "technology",
          title,
          description: group.label,
          body: title,
          url: BASE,
          relations: [{ type: "knownBy", target: personId }],
        }),
      );
  for (const title of [
    "NLP",
    "MLOps",
    "AI Governance",
    "RAG",
    "Machine Learning",
    "Teaching",
  ])
    docs.push(
      record({
        ...common,
        id: BASE + "/#skill-" + encodeURIComponent(title.toLowerCase()),
        kind: "skill",
        title,
        description:
          lang === "cs"
            ? "Oblast odborného zaměření uváděná na webu."
            : "Self-reported professional specialization.",
        body: title,
        url: BASE,
        relations: [{ type: "knownBy", target: personId }],
      }),
    );
  for (const outlet of new Set(PUBLICATIONS_DATA.map((p) => p.outlet)))
    docs.push(
      record({
        ...common,
        id: BASE + "/#publisher-" + encodeURIComponent(outlet),
        kind: "organization",
        title: outlet,
        description: "Publication outlet named in the public bibliography.",
        body: outlet,
        url: BASE + "/#publications",
      }),
    );
  for (const p of PUBLICATIONS_DATA)
    docs.push(
      record({
        ...common,
        id: BASE + "/#" + p.id,
        kind: "publication",
        title: p.title,
        description: p.blurb,
        body: p.blurb,
        url: p.href || BASE + "/#publications",
        language: "en",
        source: p.href || BASE,
        relations: [
          { type: "author", target: personId },
          {
            type: "publisher",
            target: BASE + "/#publisher-" + encodeURIComponent(p.outlet),
          },
        ],
      }),
    );
  for (const [folder, kind] of [
    ["posts", "article"],
    ["content/projects", "project"],
  ] as const) {
    for (const file of (await readdir(path.join(process.cwd(), folder)))
      .filter((f) => /^[a-z0-9-]+\.mdx?$/.test(f))
      .sort()) {
      const raw = await readFile(
        path.join(process.cwd(), folder, file),
        "utf8",
      );
      const { data, content } = matter(raw);
      const slug = file.replace(/\.mdx?$/, "");
      const url = BASE + "/blog/" + slug;
      docs.push(
        record({
          ...common,
          id: BASE + "/#" + kind + "-" + slug,
          kind,
          title: String(data.title || slug),
          description: String(
            data.description || data.tldr || data.title || slug,
          ),
          body: content,
          url,
          language: data.language === "cs" ? "cs" : "en",
          source: url,
          updatedAt: data.date
            ? new Date(data.date).toISOString()
            : snapshotDate,
          relations: [{ type: "author", target: personId }],
        }),
      );
    }
  }
  try {
    const synced = JSON.parse(
      await readFile(
        path.join(process.cwd(), "data/agent/github.json"),
        "utf8",
      ),
    ) as RecordData[];
    docs.push(...synced.filter((d) => verifyRecord(d)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return [...new Map(docs.map((d) => [d.id, d])).values()];
}
export function evidence(d: RecordData) {
  return {
    id: d.id,
    claim: d.title,
    sourceUrl: d.source,
    sourceRevision: d.sourceRevision ?? null,
    status: d.status,
    confidence:
      d.status === "source_verified" ? "source_attested" : "self_reported",
    checkedAt: d.status === "source_verified" ? d.updatedAt : null,
    integrity: { algorithm: "SHA-256", digest: d.digest },
    independentVerification:
      d.status === "source_verified"
        ? "Source supports this record; no broader qualification claim."
        : "None",
  };
}
export function graph(docs: RecordData[], root?: string, depth = 1) {
  let ids = new Set(docs.map((d) => d.id));
  if (root) {
    ids = new Set([root]);
    for (let n = 0; n < depth; n++)
      for (const d of docs)
        for (const r of d.relations)
          if (ids.has(d.id) || ids.has(r.target)) {
            ids.add(d.id);
            ids.add(r.target);
          }
  }
  return {
    nodes: docs
      .filter((d) => ids.has(d.id))
      .map((d) => ({
        id: d.id,
        type: d.kind,
        label: d.title,
        provenance: evidence(d),
      })),
    edges: docs
      .flatMap((d) =>
        d.relations.map((r) => ({
          source: d.id,
          target: r.target,
          type: r.type,
          sourceUrl: d.source,
          updatedAt: d.updatedAt,
        })),
      )
      .filter((e) => ids.has(e.source) && ids.has(e.target)),
  };
}
export function structuredData(docs: RecordData[]) {
  const types: Partial<Record<Kind, string>> = {
    person: "Person",
    project: "SoftwareApplication",
    publication: "ScholarlyArticle",
    article: "CreativeWork",
    organization: "Organization",
  };
  return {
    "@context": "https://schema.org",
    "@graph": docs
      .filter((d) => types[d.kind])
      .map((d) => ({
        "@id": d.id,
        "@type": types[d.kind],
        name: d.title,
        description: d.description,
        url: d.url,
        inLanguage: d.language,
        ...(d.kind !== "person" && d.kind !== "organization"
          ? { author: { "@id": personId } }
          : {
              knowsAbout: docs
                .filter((x) => x.kind === "skill")
                .map((x) => x.title),
            }),
      })),
  };
}
