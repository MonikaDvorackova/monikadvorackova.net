import test from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createMcpServer, handleMcp } from "../../lib/agent/mcp";
import { tools } from "../../lib/agent/service";

test("real MCP client negotiates, discovers all 15 tools, calls tools, reads resources and prompts", async () => {
  const server = createMcpServer();
  const client = new Client({ name: "integration-client", version: "1.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
  try {
    const listed = await client.listTools();
    assert.equal(listed.tools.length, 15);
    assert.deepEqual(
      listed.tools.map((t) => t.name).sort(),
      Object.keys(tools).sort(),
    );
    const result = await client.callTool({
      name: "get_profile",
      arguments: { lang: "cs" },
    });
    assert(!result.isError);
    assert.match(JSON.stringify(result), /inženýrka/);
    assert((await client.listResources()).resources.length >= 2);
    assert(
      (
        await client.readResource({
          uri: "https://monikadvorackova.net/api/v1/profile",
        })
      ).contents.length,
    );
    assert((await client.listPrompts()).prompts.length);
    assert(
      (await client.getPrompt({ name: "evidence-first-review" })).messages
        .length,
    );
  } finally {
    await client.close();
    await server.close();
  }
});
test("real MCP client interoperates over Streamable HTTP request handler", async () => {
  const transport = new StreamableHTTPClientTransport(
    new URL("https://monikadvorackova.net/mcp"),
    { fetch: async (url, init) => handleMcp(new Request(String(url), init)) },
  );
  const client = new Client({
    name: "http-integration-client",
    version: "1.0.0",
  });
  try {
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, 15);
    const result = await client.callTool({
      name: "search_knowledge",
      arguments: { query: "AIGov" },
    });
    assert(!result.isError);
    assert.match(JSON.stringify(result), /AIGov/);
  } finally {
    await client.close();
  }
});
