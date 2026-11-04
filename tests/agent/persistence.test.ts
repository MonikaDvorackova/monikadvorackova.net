import test from "node:test";
import assert from "node:assert/strict";
import {
  migrate,
  database,
  transaction,
  appendEvent,
  ledger,
  verifyLedger,
  putState,
  state,
  rateLimit,
} from "../../lib/agent/store";
import { api } from "../../lib/agent/api";
import { handleA2A } from "../../lib/agent/a2a";
const configured = !!process.env.AGENT_DATABASE_URL;
test(
  "PostgreSQL transactions, concurrent ledger writers, rate limits, inquiries and A2A survive new requests",
  { skip: !configured },
  async () => {
    await migrate();
    try {
      const suffix = crypto.randomUUID();
      await transaction(async (client) => {
        await putState(client, "test", suffix, { ok: true });
      });
      assert.deepEqual(await state("test", suffix), { ok: true });
      await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          transaction((client) =>
            appendEvent(client, { type: "test.concurrent", i, suffix }),
          ),
        ),
      );
      assert(verifyLedger(await ledger()).valid);
      await assert.rejects(
        database().query("UPDATE agent_ledger SET event='{}'::jsonb"),
        /append-only/,
      );
      const hits = await Promise.all(
        Array.from({ length: 6 }, () => rateLimit("test-" + suffix, 3)),
      );
      assert.equal(hits.filter(Boolean).length, 3);
      process.env.AGENT_INQUIRY_KEY = "t".repeat(32);
      const inquiry = {
        type: "research",
        name: "Test User",
        email: "test@example.com",
        message: "Please prepare a collaboration inquiry.",
        consent: true,
      };
      const request = () =>
        new Request("https://monikadvorackova.net/api/v1/inquiries", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "Bearer " + "t".repeat(32),
            "idempotency-key": suffix,
          },
          body: JSON.stringify(inquiry),
        });
      const a = await api(request(), ["inquiries"]);
      const b = await api(request(), ["inquiries"]);
      assert.equal(a.status, 201);
      assert.equal(b.status, 201);
      assert.deepEqual((await a.json()).data, (await b.json()).data);
      process.env.AGENT_A2A_KEY = "a".repeat(32);
      const send = {
        jsonrpc: "2.0",
        id: 1,
        method: "message/send",
        params: {
          message: {
            kind: "message",
            role: "user",
            messageId: crypto.randomUUID(),
            parts: [{ kind: "text", text: "What is AIGov?" }],
          },
        },
      };
      const rpc = (payload: unknown) =>
        handleA2A(
          new Request("https://monikadvorackova.net/a2a", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: "Bearer " + "a".repeat(32),
            },
            body: JSON.stringify(payload),
          }),
        );
      const result = await (await rpc(send)).json();
      assert.equal(result.result.status.state, "completed");
      const retrieved = await (
        await rpc({
          jsonrpc: "2.0",
          id: 2,
          method: "tasks/get",
          params: { id: result.result.id },
        })
      ).json();
      assert.equal(retrieved.result.id, result.result.id);
    } finally {
      delete process.env.AGENT_INQUIRY_KEY;
      delete process.env.AGENT_A2A_KEY;
      await database().end();
    }
  },
);
