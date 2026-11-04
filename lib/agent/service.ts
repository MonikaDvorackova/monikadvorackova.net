import { z } from "zod";
import {
  corpus,
  evidence,
  graph,
  verifyRecord,
  type Language,
  BASE,
} from "./model";
import { ask, search } from "./search";
import { ApiError } from "./http";

export const querySchema = z
  .object({
    query: z.string().trim().min(1).max(500),
    lang: z.enum(["en", "cs"]).default("en"),
    limit: z.number().int().min(1).max(100).default(10),
  })
  .strict();
export const matchSchema = z
  .object({
    requirements: z.array(z.string().trim().min(1).max(300)).min(1).max(20),
    lang: z.enum(["en", "cs"]).default("en"),
  })
  .strict();
export const inquirySchema = z
  .object({
    type: z.enum([
      "collaboration",
      "speaking",
      "research",
      "consulting",
      "technical_project",
    ]),
    name: z.string().trim().min(2).max(100),
    email: z.email().max(254),
    message: z.string().trim().min(10).max(3000),
    consent: z.literal(true),
    website: z.string().max(0).optional(),
    lang: z.enum(["en", "cs"]).default("en"),
  })
  .strict();
export const tools = {
  get_profile: z.object({ lang: z.enum(["en", "cs"]).default("en") }).strict(),
  list_skills: z.object({ lang: z.enum(["en", "cs"]).default("en") }).strict(),
  list_projects: z
    .object({ lang: z.enum(["en", "cs"]).default("en") })
    .strict(),
  list_publications: z
    .object({ lang: z.enum(["en", "cs"]).default("en") })
    .strict(),
  list_contributions: z
    .object({ lang: z.enum(["en", "cs"]).default("en") })
    .strict(),
  search_knowledge: querySchema,
  ask_profile: z
    .object({
      question: z.string().trim().min(2).max(500),
      lang: z.enum(["en", "cs"]).default("en"),
    })
    .strict(),
  get_evidence: z
    .object({
      id: z.string().max(1000),
      lang: z.enum(["en", "cs"]).default("en"),
    })
    .strict(),
  verify_evidence: z
    .object({
      id: z.string().max(1000),
      digest: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .optional(),
      lang: z.enum(["en", "cs"]).default("en"),
    })
    .strict(),
  get_knowledge_graph: z
    .object({
      root: z.string().max(1000).optional(),
      depth: z.number().int().min(0).max(4).default(1),
      lang: z.enum(["en", "cs"]).default("en"),
    })
    .strict(),
  match_capabilities: matchSchema,
  export_resume: z
    .object({ lang: z.enum(["en", "cs"]).default("en") })
    .strict(),
  export_citations: z
    .object({
      format: z.enum(["bibtex", "csl-json"]).default("csl-json"),
      lang: z.enum(["en", "cs"]).default("en"),
    })
    .strict(),
  get_recent_changes: z
    .object({
      since: z.iso.datetime().optional(),
      lang: z.enum(["en", "cs"]).default("en"),
    })
    .strict(),
  prepare_inquiry: inquirySchema,
};
export type ToolName = keyof typeof tools;
export async function invoke(name: ToolName, input: unknown) {
  const args = tools[name].parse(input) as Record<string, unknown>;
  const lang = (args.lang || "en") as Language;
  const docs = await corpus(lang);
  const list = (kind: string) =>
    docs.filter((d) => d.kind === kind).map((doc) => { const result = {...doc} as Partial<typeof doc>; delete result.body; return result as Omit<typeof doc,"body">; });
  switch (name) {
    case "get_profile":
      return list("person")[0];
    case "list_skills":
      return [...list("skill"), ...list("technology")];
    case "list_projects":
      return list("project");
    case "list_publications":
      return list("publication");
    case "list_contributions":
      return list("contribution");
    case "search_knowledge":
      return search(docs, String(args.query), Number(args.limit));
    case "ask_profile":
      return ask(docs, String(args.question));
    case "get_evidence":
    case "verify_evidence": {
      const d = docs.find((d) => d.id === args.id);
      if (!d)
        throw new ApiError(404, "not_found", "Unknown evidence identifier");
      return name === "get_evidence"
        ? evidence(d)
        : {
            valid:
              verifyRecord(d) && (!args.digest || args.digest === d.digest),
            ...evidence(d),
          };
    }
    case "get_knowledge_graph":
      return graph(docs, args.root as string | undefined, Number(args.depth));
    case "match_capabilities":
      return {
        assessment:
          "Source matches only; no inferred qualification or hiring score.",
        requirements: await Promise.all(
          (args.requirements as string[]).map(async (requirement) => ({
            requirement,
            ...(await search(docs, requirement, 3)),
          })),
        ),
      };
    case "export_resume":
      return {
        $schema:
          "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
        basics: {
          name: docs[0].title,
          label: lang === "cs" ? "AI/ML inženýrka" : "AI/ML Engineer",
          url: BASE,
          summary: docs[0].description,
        },
        skills: list("skill").map((d) => ({ name: d.title })),
        projects: list("project").map((d) => ({
          name: d.title,
          description: d.description,
          url: d.url,
        })),
        publications: list("publication").map((d) => ({
          name: d.title,
          summary: d.description,
          url: d.url,
        })),
        meta: {
          version: "1.0.0",
          language: lang,
          evidenceStatus:
            "self_reported unless explicitly indicated by evidence endpoint",
        },
      };
    case "export_citations": {
      const publications = list("publication");
      if (args.format === "bibtex")
        return publications
          .map(
            (d) =>
              "@misc{" +
              d.id.split("#")[1] +
              ",\n title={" +
              d.title.replace(/[{}\\]/g, "") +
              "},\n url={" +
              d.url +
              "}\n}",
          )
          .join("\n\n");
      return publications.map((d) => ({
        id: d.id,
        type: "article",
        title: d.title,
        URL: d.url,
        author: [{ family: "Dvořáčková", given: "Monika" }],
      }));
    }
    case "get_recent_changes":
      return docs
        .filter((d) => !args.since || d.updatedAt >= String(args.since))
        .map((d) => ({
          id: d.id,
          updatedAt: d.updatedAt,
          digest: d.digest,
          url: d.url,
        }));
    case "prepare_inquiry":
      return {
        status: "draft_only",
        deliveryEnabled: false,
        requiresManualApproval: true,
        draft: args,
      };
  }
}
