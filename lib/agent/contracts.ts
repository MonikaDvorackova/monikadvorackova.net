import { z } from "zod";
import { VERSION } from "./model";
const relation = z.object({ type: z.string(), target: z.string() });
export const publicRecord = z.object({
  id: z.string(),
  kind: z.enum([
    "person",
    "project",
    "publication",
    "article",
    "skill",
    "technology",
    "organization",
    "experience",
    "education",
    "contribution",
    "repository",
    "release",
    "issue",
  ]),
  title: z.string(),
  description: z.string(),
  url: z.url(),
  language: z.enum(["en", "cs"]),
  status: z.enum(["self_reported", "source_verified"]),
  updatedAt: z.iso.datetime({ offset: true }),
  relations: z.array(relation),
  source: z.url(),
  sourceRevision: z.string().optional(),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
});
export const evidenceRecord = z.object({
  id: z.string(),
  claim: z.string(),
  sourceUrl: z.url(),
  sourceRevision: z.string().nullable(),
  status: z.enum(["self_reported", "source_verified"]),
  confidence: z.enum(["source_attested", "self_reported"]),
  checkedAt: z.string().nullable(),
  integrity: z.object({ algorithm: z.literal("SHA-256"), digest: z.string() }),
  independentVerification: z.string(),
});
const hit = publicRecord.extend({ score: z.number(), excerpt: z.string() });
const searchResult = z.object({
  mode: z.enum(["lexical", "lexical-fallback", "hybrid-rrf"]),
  results: z.array(hit),
});
const citation = z.object({
  id: z.string(),
  url: z.url(),
  title: z.string(),
  status: z.enum(["self_reported", "source_verified"]),
  digest: z.string(),
  quote: z.string(),
});
const page = (item: z.ZodType) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    offset: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    nextOffset: z.number().int().nullable(),
  });
const change = z.object({
  id: z.string(),
  updatedAt: z.string(),
  digest: z.string(),
  url: z.url(),
});
const schemas: Record<string, z.ZodType> = {
  profile: publicRecord,
  skills: page(publicRecord),
  capabilities: page(publicRecord),
  projects: page(publicRecord),
  publications: page(publicRecord),
  contributions: page(publicRecord),
  evidence: page(evidenceRecord),
  "evidence/verify": evidenceRecord.extend({ valid: z.boolean() }),
  search: searchResult,
  graph: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        provenance: evidenceRecord,
      }),
    ),
    edges: z.array(
      z.object({
        source: z.string(),
        target: z.string(),
        type: z.string(),
        sourceUrl: z.url(),
        updatedAt: z.string(),
      }),
    ),
  }),
  ask: z.object({
    answer: z.string().nullable(),
    abstained: z.boolean(),
    reason: z.string(),
    citations: z.array(citation),
  }),
  match: z.object({
    assessment: z.string(),
    requirements: z.array(searchResult.extend({ requirement: z.string() })),
  }),
  changes: page(change),
  availability: z.object({
    status: z.literal("contact_for_availability"),
    url: z.url(),
    commitment: z.literal(false),
  }),
  health: z.object({ status: z.literal("ok"), version: z.literal(VERSION) }),
  readiness: z.object({
    status: z.enum(["ready", "degraded"]),
    publicReads: z.boolean(),
    persistentTasks: z.boolean(),
    inquiries: z.boolean(),
    outboundEnabled: z.literal(false),
    semanticConfigured: z.boolean(),
  }),
  "ledger/verify": z.object({
    valid: z.boolean(),
    checked: z.number(),
    head: z.string(),
  }),
  "sync/status": z.union([
    z.object({
      lastSuccess: z.string().nullable(),
      status: z.literal("not_synced"),
    }),
    z.object({ lastSuccess: z.string(), count: z.number() }),
  ]),
  "inquiries/prepare": z.object({
    status: z.literal("draft_only"),
    deliveryEnabled: z.literal(false),
    requiresManualApproval: z.literal(true),
    draft: z.object({
      type: z.string(),
      name: z.string(),
      email: z.email(),
      message: z.string(),
      consent: z.literal(true),
      lang: z.enum(["en", "cs"]),
    }),
  }),
  inquiries: z.object({
    id: z.string().uuid(),
    status: z.literal("stored_for_manual_review"),
    deliveryEnabled: z.literal(false),
  }),
  citations: page(
    z.object({
      id: z.string(),
      type: z.literal("article"),
      title: z.string(),
      URL: z.url(),
      author: z.array(z.object({ family: z.string(), given: z.string() })),
    }),
  ),
  resume: z.object({
    $schema: z.url(),
    basics: z.object({
      name: z.string(),
      label: z.string(),
      url: z.url(),
      summary: z.string(),
    }),
    skills: z.array(z.object({ name: z.string() })),
    projects: z.array(
      z.object({ name: z.string(), description: z.string(), url: z.url() }),
    ),
    publications: z.array(
      z.object({ name: z.string(), summary: z.string(), url: z.url() }),
    ),
    meta: z.object({
      version: z.literal(VERSION),
      language: z.enum(["en", "cs"]),
      evidenceStatus: z.string(),
    }),
  }),
};
for (const key of ["experience", "education"])
  schemas[key] = z.object({
    items: z.array(publicRecord),
    total: z.number(),
    note: z.string(),
  });
export function responseSchema(route: string) {
  return z.object({
    data: schemas[route] || z.unknown(),
    meta: z.object({
      apiVersion: z.literal(VERSION),
      language: z.enum(["en", "cs"]),
    }),
  });
}
