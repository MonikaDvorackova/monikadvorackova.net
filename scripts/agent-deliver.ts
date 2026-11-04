import { deliverNotification } from "../lib/agent/notifications";
import { database } from "../lib/agent/store";
import { z } from "zod";
async function main() {
  const id = z.string().uuid().parse(process.argv[2]);
  console.log(JSON.stringify(await deliverNotification(id)));
}
main()
  .catch(() => {
    console.error(
      "Delivery refused or failed; inspect approval/configuration and audit. No automatic retry.",
    );
    process.exitCode = 1;
  })
  .finally(() =>
    process.env.AGENT_DATABASE_URL ? database().end() : undefined,
  );
