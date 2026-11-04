import { Pool, type PoolClient } from "pg";
import { sha256 } from "./model";

let pool: Pool | undefined;
export function database() {
  if (!process.env.AGENT_DATABASE_URL)
    throw new Error("Persistent agent database is not configured");
  return (pool ??= new Pool({
    connectionString: process.env.AGENT_DATABASE_URL,
    max: 4,
    connectionTimeoutMillis: 3000,
    statement_timeout: 5000,
  }));
}
export async function transaction<T>(
  operation: (client: PoolClient) => Promise<T>,
) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
export async function migrate() {
  await database()
    .query(`CREATE TABLE IF NOT EXISTS agent_state (namespace text NOT NULL, key text NOT NULL, value jsonb NOT NULL, expires_at timestamptz, PRIMARY KEY(namespace,key));
  CREATE TABLE IF NOT EXISTS agent_ledger (seq bigserial PRIMARY KEY, event jsonb NOT NULL, at text NOT NULL, previous_hash text NOT NULL, hash text NOT NULL);
  CREATE TABLE IF NOT EXISTS agent_limits (subject text PRIMARY KEY, bucket bigint NOT NULL, hits integer NOT NULL);
  CREATE OR REPLACE FUNCTION agent_ledger_immutable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Audit ledger is append-only'; END $$;
  DROP TRIGGER IF EXISTS agent_ledger_immutable ON agent_ledger;
  CREATE TRIGGER agent_ledger_immutable BEFORE UPDATE OR DELETE ON agent_ledger FOR EACH ROW EXECUTE FUNCTION agent_ledger_immutable();`);
}
export type LedgerEvent = {
  seq: number;
  event: unknown;
  at: string;
  previousHash: string;
  hash: string;
};
export function chainEvent(
  event: unknown,
  previousHash: string,
  seq: number,
  at = new Date().toISOString(),
): LedgerEvent {
  return {
    seq,
    event,
    at,
    previousHash,
    hash: sha256({ seq, event, at, previousHash }),
  };
}
export function verifyLedger(events: LedgerEvent[], expectedHead?: string) {
  let prev = "0".repeat(64);
  let seq = 0;
  for (const e of events) {
    if (
      e.seq !== ++seq ||
      e.previousHash !== prev ||
      e.hash !== chainEvent(e.event, prev, e.seq, e.at).hash
    )
      return { valid: false, checked: seq - 1, head: prev };
    prev = e.hash;
  }
  return {
    valid: !expectedHead || prev === expectedHead,
    checked: seq,
    head: prev,
  };
}
export async function appendEvent(client: PoolClient, event: unknown) {
  await client.query("SELECT pg_advisory_xact_lock(81724001)");
  const { rows } = await client.query(
    "SELECT seq,hash FROM agent_ledger ORDER BY seq DESC LIMIT 1",
  );
  const last = rows[0];
  const entry = chainEvent(
    event,
    last?.hash || "0".repeat(64),
    Number(last?.seq || 0) + 1,
  );
  await client.query(
    "INSERT INTO agent_ledger(seq,event,at,previous_hash,hash) VALUES($1,$2,$3,$4,$5)",
    [
      entry.seq,
      JSON.stringify(event),
      entry.at,
      entry.previousHash,
      entry.hash,
    ],
  );
  return entry;
}
export async function ledger() {
  const { rows } = await database().query(
    'SELECT seq,event,at,previous_hash AS "previousHash",hash FROM agent_ledger ORDER BY seq',
  );
  return rows.map((r) => ({ ...r, seq: Number(r.seq) })) as LedgerEvent[];
}
const localLimits = new Map<string, { bucket: number; hits: number }>();
export async function rateLimit(subject: string, limit: number) {
  const bucket = Math.floor(Date.now() / 60000);
  if (process.env.AGENT_DATABASE_URL) {
    const { rows } = await database().query(
      `INSERT INTO agent_limits VALUES($1,$2,1) ON CONFLICT(subject) DO UPDATE SET bucket=$2,hits=CASE WHEN agent_limits.bucket=$2 THEN agent_limits.hits+1 ELSE 1 END RETURNING hits`,
      [subject, bucket],
    );
    return rows[0].hits <= limit;
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.AGENT_REQUIRE_DURABLE_LIMITS === "true"
  )
    throw new Error("Durable rate limiter is not configured");
  if (localLimits.size > 10000)
    for (const [key, value] of localLimits)
      if (value.bucket !== bucket) localLimits.delete(key);
  const old = localLimits.get(subject);
  const entry = { bucket, hits: old?.bucket === bucket ? old.hits + 1 : 1 };
  localLimits.set(subject, entry);
  return entry.hits <= limit;
}
export async function state(namespace: string, key: string) {
  const { rows } = await database().query(
    "SELECT value FROM agent_state WHERE namespace=$1 AND key=$2 AND (expires_at IS NULL OR expires_at>now())",
    [namespace, key],
  );
  return rows[0]?.value;
}
export async function putState(
  client: PoolClient,
  namespace: string,
  key: string,
  value: unknown,
  days = 30,
) {
  await client.query(
    "INSERT INTO agent_state VALUES($1,$2,$3,now()+($4::text||' days')::interval) ON CONFLICT(namespace,key) DO UPDATE SET value=$3,expires_at=excluded.expires_at",
    [namespace, key, JSON.stringify(value), days],
  );
}
