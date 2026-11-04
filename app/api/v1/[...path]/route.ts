import { api } from "@/lib/agent/api";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  return api(req, (await context.params).path);
}
export const POST = GET;

export async function OPTIONS(req: Request) {
  const { guard, headers, failure } = await import("@/lib/agent/http");
  try {
    await guard(req);
    return new Response(null, {
      status: 204,
      headers: {
        ...headers(),
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, Idempotency-Key",
      },
    });
  } catch (error) {
    return failure(error);
  }
}
