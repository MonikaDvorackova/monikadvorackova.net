import { responseSchema } from "./contracts";
import { z } from "zod";
import { corpus, evidence, BASE, VERSION, sha256 } from "./model";
import { invoke, inquirySchema, tools, type ToolName } from "./service";
import {
  guard,
  authorize,
  body,
  json,
  observed,
  language,
  ApiError,
} from "./http";
import {
  database,
  transaction,
  putState,
  appendEvent,
  ledger,
  verifyLedger,
} from "./store";

const readTools: Record<string, ToolName> = {
  profile: "get_profile",
  skills: "list_skills",
  capabilities: "list_skills",
  projects: "list_projects",
  publications: "list_publications",
  contributions: "list_contributions",
  graph: "get_knowledge_graph",
  resume: "export_resume",
  citations: "export_citations",
  changes: "get_recent_changes",
};
export const readPaths = [
  ...Object.keys(readTools),
  "availability",
  "experience",
  "education",
  "evidence",
  "evidence/verify",
  "search",
  "health",
  "readiness",
  "ledger/verify",
  "sync/status",
];
export const writePaths = [
  "ask",
  "match",
  "inquiries/prepare",
  "inquiries",
  "notifications/approve",
];
export async function api(req: Request, segments: string[]) {
  return observed(req, async () => {
    const result = await execute(req, segments);
    if (
      result.ok &&
      result.headers.get("content-type")?.includes("application/json")
    )
      responseSchema(segments.join("/")).parse(await result.clone().json());
    return result;
  });
}
async function execute(req: Request, segments: string[]) {
  await guard(req);
  const lang = language(req);
  const params = new URL(req.url).searchParams;
  const route = segments.join("/");
  if (req.method === "GET") {
    if (route === "health")
      return json({ status: "ok", version: VERSION }, lang);
    if (route === "readiness") {
      let db = false;
      try {
        await database().query("SELECT 1 FROM agent_state LIMIT 1");
        db = true;
      } catch {}
      return json(
        {
          status: db ? "ready" : "degraded",
          publicReads: true,
          persistentTasks: db,
          inquiries: db && !!process.env.AGENT_INQUIRY_KEY,
          outboundEnabled: false,
          semanticConfigured: !!process.env.AGENT_EMBEDDING_KEY,
        },
        lang,
        db ? 200 : 503,
      );
    }
    if (route === "sync/status") {
      const { readFile } = await import("node:fs/promises");
      let status: unknown = { lastSuccess: null, status: "not_synced" };
      try {
        status = JSON.parse(
          await readFile("data/agent/sync-status.json", "utf8"),
        );
      } catch {}
      return json(status, lang);
    }
    if (route === "availability")
      return json(
        { status: "contact_for_availability", url: BASE, commitment: false },
        lang,
      );
    if (route === "experience" || route === "education") {
      const items = (await corpus(lang))
        .filter((d) => d.kind === route)
        .map((doc) => {
          const { body: _, ...item } = doc;
          void _;
          return item;
        });
      return json(
        {
          items,
          total: items.length,
          note: items.length
            ? "Source-linked career claims; see evidence status."
            : "No structured records published; no qualifications inferred.",
        },
        lang,
      );
    }
    if (route === "ledger/verify") {
      authorize(req, "admin");
      return json(
        verifyLedger(await ledger(), params.get("head") || undefined),
        lang,
      );
    }
    if (route === "evidence")
      return page((await corpus(lang)).map(evidence), params, lang);
    if (route === "evidence/verify") {
      const id = z.string().min(1).max(1000).parse(params.get("id"));
      return json(
        await invoke("verify_evidence", {
          id,
          digest: params.get("digest") || undefined,
          lang,
        }),
        lang,
      );
    }
    if (route === "search") {
      const query = z.string().trim().min(1).max(500).parse(params.get("q"));
      const limit = z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .parse(params.get("limit") || undefined);
      let docs = await corpus(lang);
      const kind = params.get("kind");
      const status = params.get("status");
      if (kind) docs = docs.filter((d) => d.kind === kind);
      if (status) docs = docs.filter((d) => d.status === status);
      const { search } = await import("./search");
      return json(await search(docs, query, limit), lang);
    }
    const tool = readTools[route];
    if (tool) {
      const args: Record<string, unknown> = { lang };
      if (route === "graph") {
        args.root = params.get("root") || undefined;
        args.depth = Number(params.get("depth") || 1);
      }
      if (route === "citations")
        args.format = params.get("format") || "csl-json";
      if (route === "changes") args.since = params.get("since") || undefined;
      let result: unknown = await invoke(tool, args);
      if (route === "contributions" && Array.isArray(result)) {
        const state = params.get("state");
        const scope = params.get("scope");
        if (state) {
          z.enum(["opened", "closed", "merged"]).parse(state);
          result = result.filter(
            (d) =>
              (d as { contributionState?: string }).contributionState === state,
          );
        }
        if (scope) {
          z.enum(["upstream", "own_repository"]).parse(scope);
          result = (result as unknown[]).filter(
            (d) =>
              (d as { contributionScope?: string }).contributionScope === scope,
          );
        }
      }
      if (typeof result === "string")
        return new Response(result, {
          headers: {
            "Content-Type": "application/x-bibtex; charset=utf-8",
            "Content-Language": lang,
          },
        });
      if (
        (params.get("format") === "markdown" ||
          req.headers.get("accept")?.includes("text/markdown")) &&
        route === "profile"
      )
        return new Response(
          "# Monika Dvořáčková\n\n" +
            (result as { description: string }).description +
            "\n\nSource: " +
            BASE,
          {
            headers: {
              "Content-Type": "text/markdown; charset=utf-8",
              "Content-Language": lang,
            },
          },
        );
      return Array.isArray(result)
        ? page(result, params, lang)
        : json(result, lang);
    }
  }
  if (req.method === "POST") {
    const payload = await body(req);
    if (route === "notifications/approve") {
      authorize(req, "admin");
      const input = z
        .object({
          inquiryId: z.string().uuid(),
          approvalId: z.string().min(16).max(128),
        })
        .strict()
        .parse(payload);
      const { approveNotification } = await import("./notifications");
      return json(
        await approveNotification(input.inquiryId, input.approvalId),
        lang,
      );
    }

    if (route === "ask" || route === "match" || route === "inquiries/prepare")
      return json(
        await invoke(
          route === "ask"
            ? "ask_profile"
            : route === "match"
              ? "match_capabilities"
              : "prepare_inquiry",
          { ...(payload as object), lang },
        ),
        lang,
      );
    if (route === "inquiries") {
      const owner = authorize(req, "inquiry");
      const input = inquirySchema.parse(payload);
      const key = z
        .string()
        .min(16)
        .max(128)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .parse(req.headers.get("idempotency-key"));
      const hash = sha256(input);
      if (!process.env.AGENT_DATABASE_URL)
        throw new ApiError(
          503,
          "not_configured",
          "Persistent inquiry storage is required",
        );
      const result = await transaction(async (client) => {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
          owner + key,
        ]);
        const { rows } = await client.query(
          "SELECT value FROM agent_state WHERE namespace=$1 AND key=$2 AND expires_at>now()",
          ["inquiry-idempotency:" + owner, key],
        );
        if (rows[0]) {
          if (rows[0].value.hash !== hash)
            throw new ApiError(
              409,
              "idempotency_conflict",
              "Key already used with different content",
            );
          return rows[0].value.result;
        }
        const id = crypto.randomUUID();
        const result = {
          id,
          status: "stored_for_manual_review",
          deliveryEnabled: false,
        };
        await putState(client, "inquiries", id, input, 30);
        await putState(
          client,
          "inquiry-idempotency:" + owner,
          key,
          { hash, result },
          30,
        );
        await appendEvent(client, { type: "inquiry.received", id });
        return result;
      });
      return json(result, lang, 201);
    }
  }
  throw new ApiError(404, "not_found", "Unknown API endpoint");
}
function page(items: unknown[], params: URLSearchParams, lang: string) {
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .max(100000)
    .default(0)
    .parse(params.get("offset") || undefined);
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .parse(params.get("limit") || undefined);
  return json(
    {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
      nextOffset: offset + limit < items.length ? offset + limit : null,
    },
    lang,
  );
}
export function openapi() {
  const error = {
    description: "Error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  };
  const queryParameters: Record<
    string,
    { name: string; in: string; schema: Record<string, unknown> }[]
  > = {
    search: [
      { name: "kind", in: "query", schema: { type: "string" } },
      {
        name: "status",
        in: "query",
        schema: { enum: ["self_reported", "source_verified"] },
      },
      {
        name: "limit",
        in: "query",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
      },
    ],
    graph: [
      { name: "root", in: "query", schema: { type: "string" } },
      {
        name: "depth",
        in: "query",
        schema: { type: "integer", minimum: 0, maximum: 4, default: 1 },
      },
    ],
    contributions: [
      {
        name: "state",
        in: "query",
        schema: { enum: ["opened", "closed", "merged"] },
      },
      {
        name: "scope",
        in: "query",
        schema: { enum: ["upstream", "own_repository"] },
      },
    ],
    changes: [
      {
        name: "since",
        in: "query",
        schema: { type: "string", format: "date-time" },
      },
    ],
    citations: [
      {
        name: "format",
        in: "query",
        schema: { enum: ["csl-json", "bibtex"], default: "csl-json" },
      },
    ],
    profile: [
      { name: "format", in: "query", schema: { enum: ["json", "markdown"] } },
    ],
    "evidence/verify": [
      {
        name: "digest",
        in: "query",
        schema: { type: "string", pattern: "^[a-f0-9]{64}$" },
      },
    ],
    "ledger/verify": [
      {
        name: "head",
        in: "query",
        schema: { type: "string", pattern: "^[a-f0-9]{64}$" },
      },
    ],
  };
  const requestExamples: Record<string, unknown> = {
    ask: { question: "What is AIGov?", lang: "en" },
    match: { requirements: ["MLOps"], lang: "en" },
    inquiries: {
      type: "research",
      name: "Example Researcher",
      email: "researcher@example.com",
      message: "I would like to discuss a research collaboration.",
      consent: true,
      lang: "en",
    },
    "inquiries/prepare": {
      type: "consulting",
      name: "Example Client",
      email: "client@example.com",
      message: "Please prepare a technical consulting inquiry.",
      consent: true,
      lang: "en",
    },
    "notifications/approve": {
      inquiryId: "00000000-0000-4000-8000-000000000001",
      approvalId: "operator-review-record-0001",
    },
  };
  const paths: Record<string, unknown> = {};
  for (const name of [...readPaths, ...writePaths]) {
    const post = writePaths.includes(name);
    const requestTool =
      name === "ask"
        ? "ask_profile"
        : name === "match"
          ? "match_capabilities"
          : "prepare_inquiry";
    const protectedRoute =
      name === "inquiries" ||
      name === "ledger/verify" ||
      name === "notifications/approve";
    paths["/api/v1/" + name] = {
      [post ? "post" : "get"]: {
        operationId: name.replaceAll("/", "_"),
        summary: name,
        parameters: post
          ? name === "inquiries"
            ? [
                {
                  name: "Idempotency-Key",
                  in: "header",
                  required: true,
                  schema: { type: "string", minLength: 16, maxLength: 128 },
                },
              ]
            : []
          : [
              { name: "lang", in: "query", schema: { enum: ["en", "cs"] } },
              ...(queryParameters[name] || []),
              ...([
                "skills",
                "capabilities",
                "projects",
                "publications",
                "contributions",
                "changes",
                "evidence",
                "citations",
              ].includes(name)
                ? [
                    {
                      name: "limit",
                      in: "query",
                      schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 20,
                      },
                    },
                    {
                      name: "offset",
                      in: "query",
                      schema: { type: "integer", minimum: 0, default: 0 },
                    },
                  ]
                : []),
              ...(name === "search"
                ? [
                    {
                      name: "q",
                      in: "query",
                      required: true,
                      schema: { type: "string", minLength: 1, maxLength: 500 },
                    },
                  ]
                : []),
              ...(name.startsWith("evidence/verify")
                ? [
                    {
                      name: "id",
                      in: "query",
                      required: true,
                      schema: { type: "string" },
                    },
                  ]
                : []),
            ],
        ...(post
          ? {
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    example: requestExamples[name],
                    schema:
                      name === "notifications/approve"
                        ? {
                            type: "object",
                            required: ["inquiryId", "approvalId"],
                            properties: {
                              inquiryId: { type: "string", format: "uuid" },
                              approvalId: {
                                type: "string",
                                minLength: 16,
                                maxLength: 128,
                              },
                            },
                            additionalProperties: false,
                          }
                        : z.toJSONSchema(tools[requestTool]),
                  },
                },
              },
            }
          : {}),
        ...(protectedRoute ? { security: [{ bearer: [] }] } : {}),
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: z.toJSONSchema(responseSchema(name)),
                ...(name === "health"
                  ? {
                      example: {
                        data: { status: "ok", version: VERSION },
                        meta: { apiVersion: VERSION, language: "en" },
                      },
                    }
                  : {}),
              },
            },
          },
          ...(name === "inquiries"
            ? {
                "201": {
                  description:
                    "Stored for manual review; outbound delivery disabled",
                },
              }
            : {}),
          "400": error,
          "401": error,
          "403": error,
          "404": error,
          "409": error,
          "413": error,
          "415": error,
          "422": error,
          "429": error,
          "500": error,
          "503": error,
        },
      },
    };
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "Monika Dvořáčková Professional Knowledge API",
      version: VERSION,
      description:
        "Public evidence-first profile. Content claims are self-reported unless supported by source verification.",
    },
    servers: [{ url: BASE }],
    paths,
    components: {
      securitySchemes: { bearer: { type: "http", scheme: "bearer" } },
    },
  };
}
