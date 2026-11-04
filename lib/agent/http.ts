import { timingSafeEqual, createHmac } from "node:crypto";
import { z } from "zod";
import { BASE, VERSION, sha256 } from "./model";
import { rateLimit } from "./store";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const languageSchema = z.enum(["en", "cs"]);
export function language(req: Request) {
  const q = new URL(req.url).searchParams.get("lang");
  if (q) return languageSchema.parse(q);
  return req.headers.get("accept-language")?.toLowerCase().startsWith("cs")
    ? "cs"
    : "en";
}
export async function body(req: Request): Promise<unknown> {
  if (!req.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "unsupported_media_type", "Use application/json");
  const reader = req.body?.getReader();
  if (!reader)
    throw new ApiError(400, "invalid_json", "A JSON body is required");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) {
      await reader.cancel();
      throw new ApiError(
        413,
        "request_too_large",
        "Maximum body is 16384 bytes",
      );
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "invalid_json", "Invalid JSON");
  }
}
export function authorize(req: Request, scope: "admin" | "a2a" | "inquiry") {
  const configured = process.env["AGENT_" + scope.toUpperCase() + "_KEY"];
  if (!configured || configured.length < 32)
    throw new ApiError(
      503,
      "not_configured",
      "Protected service is not configured",
    );
  const actual = Buffer.from(req.headers.get("authorization") || "");
  const expected = Buffer.from("Bearer " + configured);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new ApiError(401, "unauthorized", "Valid bearer token required");
  return sha256(configured);
}
export async function guard(req: Request, scope = "public") {
  const origin = req.headers.get("origin");
  const allowed = [
    BASE,
    ...(process.env.VERCEL_URL ? ["https://" + process.env.VERCEL_URL] : []),
    ...(process.env.AGENT_ALLOWED_ORIGINS || "").split(",").filter(Boolean),
  ];
  if (origin && !allowed.includes(origin))
    throw new ApiError(403, "origin_forbidden", "Origin is not allowed");
  // Never persist raw network addresses; edge must overwrite this header in production.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const secret = process.env.AGENT_RATE_SALT || "local-public-rate-bucket";
  const subject = createHmac("sha256", secret)
    .update(scope + ":" + ip)
    .digest("hex");
  if (!(await rateLimit(subject, scope === "public" ? 120 : 30)))
    throw new ApiError(429, "rate_limited", "Request limit exceeded");
}
export function json(data: unknown, lang = "en", status = 200) {
  return Response.json(
    { data, meta: { apiVersion: VERSION, language: lang } },
    { status, headers: headers(lang) },
  );
}
export function headers(lang = "en"): Record<string, string> {
  return {
    "Content-Language": lang,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    Vary: "Accept, Accept-Language, Origin",
    "Access-Control-Allow-Origin": BASE,
    "X-Agent-API-Version": VERSION,
  };
}
export function failure(error: unknown) {
  const status =
    error instanceof ApiError
      ? error.status
      : error instanceof z.ZodError
        ? 422
        : 500;
  const code =
    error instanceof ApiError
      ? error.code
      : error instanceof z.ZodError
        ? "validation_failed"
        : "internal_error";
  return Response.json(
    {
      error: {
        code,
        message:
          status === 500
            ? "Internal service error"
            : error instanceof ApiError
              ? error.message
              : "Invalid request parameters",
      },
    },
    {
      status,
      headers: {
        ...headers(),
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
export async function observed(
  req: Request,
  operation: () => Promise<Response>,
) {
  const start = performance.now();
  let result: Response;
  try {
    result = await operation();
  } catch (e) {
    result = failure(e);
  }
  console.info(
    JSON.stringify({
      event: "agent_request",
      method: req.method,
      path: new URL(req.url).pathname,
      status: result.status,
      latencyMs: Math.round(performance.now() - start),
      requestId: crypto.randomUUID(),
    }),
  );
  return result;
}
