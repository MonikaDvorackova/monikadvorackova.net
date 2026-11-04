import { revalidateSources } from "../lib/agent/revalidation";
import { database } from "../lib/agent/store";
revalidateSources()
  .then((results) => console.log(JSON.stringify(results)))
  .catch(() => {
    console.error("Revalidation failed");
    process.exitCode = 1;
  })
  .finally(() => database().end());
