import { migrate, database } from "../lib/agent/store";
migrate()
  .then(() => console.log("Agent schema migration complete"))
  .catch(() => {
    console.error("Migration failed");
    process.exitCode = 1;
  })
  .finally(() => database().end());
