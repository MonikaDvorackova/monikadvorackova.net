import { z } from "zod";
import { randomUUID } from "node:crypto";
import { BASE, VERSION } from "./model";
import { authorize, body, guard, observed, ApiError } from "./http";
import type { PoolClient } from "pg";
import { database, transaction, putState, appendEvent } from "./store";
import { invoke } from "./service";

export function agentCard() {
  return {
    protocolVersion: "0.3.0",
    name: "Monika Dvořáčková Professional Knowledge",
    description:
      "Cited public professional knowledge and inquiry drafts; no external actions.",
    url: BASE + "/a2a",
    preferredTransport: "JSONRPC",
    version: VERSION,
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: true,
    },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["application/json"],
    securitySchemes: { bearer: { type: "http", scheme: "bearer" } },
    security: [{ bearer: [] }],
    skills: [
      {
        id: "professional-evidence",
        name: "Professional evidence",
        description: "Extract cited public facts and preserve evidence status.",
        tags: ["research", "MLOps", "AI governance"],
        examples: ["What is AIGov?"],
      },
    ],
    supportsAuthenticatedExtendedCard: false,
  };
}
const messageSchema = z
  .object({
    kind: z.literal("message"),
    role: z.literal("user"),
    messageId: z.string().min(1).max(128),
    taskId: z.string().uuid().optional(),
    contextId: z.string().uuid().optional(),
    parts: z
      .array(
        z
          .object({
            kind: z.literal("text"),
            text: z.string().trim().min(2).max(500),
          })
          .strict(),
      )
      .min(1)
      .max(5),
  })
  .strict();
const requestSchema = z
  .object({
    jsonrpc: z.literal("2.0"),
    id: z.union([z.string().max(128), z.number().int()]),
    method: z.string().max(100),
    params: z.unknown(),
  })
  .strict();
export type A2ATask = {
  kind: "task";
  id: string;
  contextId: string;
  status: {
    state:
      | "submitted"
      | "working"
      | "input-required"
      | "completed"
      | "failed"
      | "canceled";
    timestamp: string;
  };
  history: unknown[];
  artifacts?: unknown[];
};
export interface TaskRepository {
  get(owner: string, id: string): Promise<A2ATask | undefined>;
  save(owner: string, task: A2ATask, event: string): Promise<void>;
  replay(
    owner: string,
    messageId: string,
    hash: string,
  ): Promise<A2ATask | undefined>;
  cache(
    owner: string,
    messageId: string,
    hash: string,
    task: A2ATask,
  ): Promise<void>;
}
function persistentTasks(client: PoolClient): TaskRepository {
  const read = async (namespace: string, key: string) => {
    const { rows } = await client.query(
      "SELECT value FROM agent_state WHERE namespace=$1 AND key=$2 AND expires_at>now() FOR UPDATE",
      [namespace, key],
    );
    return rows[0]?.value;
  };
  return {
    async get(owner, id) {
      return read("a2a:" + owner, id);
    },
    async save(owner, task, event) {
      const existing = await read("a2a:" + owner, task.id);
      if (
        existing &&
        ["completed", "failed", "canceled"].includes(existing.status.state) &&
        existing.status.state !== task.status.state
      )
        throw new RpcError(-32002, "Task already terminal");
      await putState(client, "a2a:" + owner, task.id, task, 7);
      await appendEvent(client, {
        type: event,
        taskId: task.id,
        state: task.status.state,
      });
    },
    async replay(owner, id, hash) {
      const cached = await read("a2a-messages:" + owner, id);
      if (cached && cached.hash !== hash)
        throw new RpcError(
          -32602,
          "Message ID already used with different content",
        );
      return cached?.task;
    },
    async cache(owner, id, hash, task) {
      await putState(client, "a2a-messages:" + owner, id, { hash, task }, 7);
    },
  };
}

class RpcError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}
export async function dispatchA2A(
  raw: unknown,
  owner: string,
  repo: TaskRepository,
) {
  let id: string | number | null = null;
  if (!requestSchema.safeParse(raw).success)
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid request" },
    };
  try {
    const request = requestSchema.parse(raw);
    id = request.id;
    if (request.method === "message/send") {
      const { message, configuration } = z
        .object({
          message: messageSchema,
          configuration: z
            .object({
              blocking: z.boolean().optional(),
              acceptedOutputModes: z.array(z.string()).optional(),
              historyLength: z.number().int().min(0).max(100).optional(),
            })
            .strict()
            .optional(),
        })
        .strict()
        .parse(request.params);
      const { sha256 } = await import("./model");
      const hash = sha256(message);
      const replay = await repo.replay(owner, message.messageId, hash);
      if (replay) return { jsonrpc: "2.0", id, result: replay };
      if (message.taskId) {
        const old = await repo.get(owner, message.taskId);
        if (!old) throw new RpcError(-32001, "Task not found");
        if (["completed", "failed", "canceled"].includes(old.status.state))
          throw new RpcError(-32602, "Terminal task cannot be restarted");
      }
      const task: A2ATask = {
        kind: "task",
        id: message.taskId || randomUUID(),
        contextId: message.contextId || randomUUID(),
        status: { state: "submitted", timestamp: new Date().toISOString() },
        history: [message],
      };
      await repo.save(owner, task, "a2a.submitted");
      task.status = { state: "working", timestamp: new Date().toISOString() };
      await repo.save(owner, task, "a2a.working");
      try {
        const result = await invoke("ask_profile", {
          question: message.parts
            .map((p) => p.text)
            .join(" ")
            .slice(0, 500),
        });
        task.artifacts = [
          {
            artifactId: randomUUID(),
            name: "Cited professional evidence",
            parts: [{ kind: "data", data: result }],
          },
        ];
        task.history.push({
          kind: "message",
          role: "agent",
          messageId: randomUUID(),
          taskId: task.id,
          contextId: task.contextId,
          parts: [{ kind: "data", data: result }],
        });
        task.status = {
          state: "completed",
          timestamp: new Date().toISOString(),
        };
      } catch {
        task.status = { state: "failed", timestamp: new Date().toISOString() };
      }
      await repo.save(owner, task, "a2a." + task.status.state);
      await repo.cache(owner, message.messageId, hash, task);
      const result = {
        ...task,
        history:
          configuration?.historyLength === 0
            ? []
            : task.history.slice(-(configuration?.historyLength || 100)),
      };
      return { jsonrpc: "2.0", id, result };
    }
    if (request.method === "tasks/get" || request.method === "tasks/cancel") {
      const params = z
        .object({
          id: z.string().uuid(),
          historyLength: z.number().int().min(0).max(100).optional(),
        })
        .strict()
        .parse(request.params);
      const task = await repo.get(owner, params.id);
      if (!task) throw new RpcError(-32001, "Task not found");
      if (request.method === "tasks/cancel") {
        if (["completed", "failed", "canceled"].includes(task.status.state))
          throw new RpcError(-32002, "Task cannot be canceled");
        task.status = {
          state: "canceled",
          timestamp: new Date().toISOString(),
        };
        await repo.save(owner, task, "a2a.canceled");
      }
      return {
        jsonrpc: "2.0",
        id,
        result: {
          ...task,
          history:
            params.historyLength === 0
              ? []
              : task.history.slice(-(params.historyLength || 100)),
        },
      };
    }
    throw new RpcError(-32601, "Method not found");
  } catch (e) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code:
          e instanceof RpcError
            ? e.code
            : e instanceof z.ZodError
              ? -32602
              : -32603,
        message:
          e instanceof RpcError
            ? e.message
            : e instanceof z.ZodError
              ? "Invalid parameters"
              : "Internal error",
      },
    };
  }
}
export async function handleA2A(req: Request) {
  return observed(req, async () => {
    const owner = authorize(req, "a2a");
    await guard(req, "a2a");
    if (!process.env.AGENT_DATABASE_URL)
      throw new ApiError(
        503,
        "not_configured",
        "Persistent task storage is required",
      );
    await database().query("SELECT 1");
    let payload: unknown;
    try {
      payload = await body(req);
    } catch (error) {
      if (error instanceof ApiError && error.code === "invalid_json")
        return Response.json({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        });
      throw error;
    }
    const result = await transaction(async (client) => {
      const parsed = requestSchema.safeParse(payload);
      if (parsed.success) {
        const params = parsed.data.params as
          | { message?: { messageId?: string; taskId?: string }; id?: string }
          | undefined;
        const lock =
          params?.message?.taskId ||
          params?.id ||
          params?.message?.messageId ||
          String(parsed.data.id);
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
          owner + ":" + lock,
        ]);
      }
      return dispatchA2A(payload, owner, persistentTasks(client));
    });
    const method = requestSchema.safeParse(payload);
    console.info(
      JSON.stringify({
        event: "a2a_rpc",
        method:
          method.success &&
          ["message/send", "tasks/get", "tasks/cancel"].includes(
            method.data.method,
          )
            ? method.data.method
            : "unknown",
        status: result.error ? "error" : "ok",
        errorCode: result.error?.code,
      }),
    );
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  });
}
