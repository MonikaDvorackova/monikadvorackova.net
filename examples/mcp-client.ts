import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
async function main() {
  const client = new Client({
    name: "public-profile-review",
    version: "1.0.0",
  });
  try {
    await client.connect(
      new StreamableHTTPClientTransport(
        new URL("https://monikadvorackova.net/mcp"),
      ),
    );
    console.log(
      await client.callTool({
        name: "search_knowledge",
        arguments: { query: "MLOps", lang: "en" },
      }),
    );
  } finally {
    await client.close();
  }
}
main();
