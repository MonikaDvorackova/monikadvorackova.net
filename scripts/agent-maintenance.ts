import { transaction, database, appendEvent } from "../lib/agent/store";
transaction(async (client) => {
  const expired = await client.query(
    "DELETE FROM agent_state WHERE expires_at<now()",
  );
  await client.query("DELETE FROM agent_limits WHERE bucket<$1", [
    Math.floor(Date.now() / 60000) - 60,
  ]);
  await appendEvent(client, {
    type: "retention.expired",
    count: expired.rowCount,
  });
})
  .catch(() => {
    console.error("Retention failed");
    process.exitCode = 1;
  })
  .finally(() => database().end());
