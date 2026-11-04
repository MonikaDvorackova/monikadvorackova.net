# Agent platform operations

## Architecture and authority

Next.js owns HTML, REST v1, MCP Streamable HTTP and A2A 0.3 JSON-RPC. No FastAPI service is deployed. The supplied Python package duplicated website facts, had a discovery-only A2A card and incomplete MCP registrations; integrating two independently maintained models would preserve those inconsistencies.

`lib/agent/model.ts` reads a deterministic catalog generated from MDX articles/projects before dev/build, the shared `lib/publications.ts` bibliography, shared `lib/stack.ts` technologies and a generated public GitHub snapshot. Changes to these sources automatically flow into discovery, graph, feeds, search, QA and exports. The generated catalog records the raw MDX SHA-256 and a Git modification timestamp (or explicit frontmatter lastModified/updatedAt); committed catalog timestamps are preserved when Git metadata is absent and the source hash is unchanged. Website visual components consume the same extracted publication/technology arrays. No visual CSS or navigation redesign is included.

A content SHA-256 covers every record field except the digest. These are integrity checks, not signatures or proof of qualifications. Website statements are self-reported. GitHub source verification supports only the repository/PR/release facts returned by the public source, not employment, adoption or impact. Source reachability checks never upgrade verification status. Original-language content falls back to English and declares its language; Czech profile text and API metadata are available. Experience and education are loaded from schema-validated `data/agent/career.json`. Its collections are currently empty because the website does not publish source-reviewed structured career records. Populate only approved public claims with source URLs; manual entries remain self-reported. Empty collections do not infer qualifications.

## Configuration

| Variable | Purpose |
| --- | --- |
| AGENT_DATABASE_URL | Dedicated PostgreSQL connection for tasks, inquiry drafts, audit and distributed rate limits. Use a pooled TLS connection and least-privilege runtime role. Never use a production DB for previews. |
| AGENT_ADMIN_KEY | At least 32 random characters, protects ledger verification. |
| AGENT_A2A_KEY | At least 32 random characters, issued to trusted A2A clients. Tasks are isolated by the SHA-256 of the credential. Rotation changes task ownership. |
| AGENT_INQUIRY_KEY | At least 32 random characters, required to store consented inquiry drafts. |
| AGENT_RATE_SALT | Independent random secret for HMAC network pseudonyms. |
| AGENT_ALLOWED_ORIGINS | Explicit comma-separated HTTPS origins permitted for browser calls; the deployment's own trusted VERCEL_URL is allowed automatically. |
| AGENT_REQUIRE_DURABLE_LIMITS | Set true in production to fail closed if durable limiting is unavailable. Without DB, development/preview limits are process-local. |
| AGENT_EMBEDDING_KEY | Optional OpenAI embedding access; public corpus only. No model key is sent to clients. |
| AGENT_EMBEDDING_MODEL | Defaults to text-embedding-3-small. Rebuild the index when changed. |
| AGENT_GITHUB_TOKEN | Read-only GitHub token for synchronization. Public resources only. |

Outbound delivery is disabled. A fixed-origin Resend adapter exists in `lib/agent/notifications.ts`; it has not been activated or live-tested. Inquiry preparation returns a draft; submission stores it for manual review. Enabling mail delivery requires explicit authorization, a provider key, approved sender/recipient, AGENT_NOTIFICATIONS_ENABLED=true and AGENT_NOTIFICATION_APPROVAL_ID. Each inquiry additionally needs an authenticated admin approval using the same approval identifier. `npm run agent:deliver -- INQUIRY_UUID` sends only to the configured operator address. No worker is scheduled. Uncertain provider outcomes require manual reconciliation and reapproval; they are not automatically retried. No endpoint books meetings, contacts third parties or executes arbitrary actions.

## Deploy a preview

1. Create an isolated PostgreSQL database and configure preview-only values using the hosting secret manager. Do not print keys or commit environment files.
2. Run `npm ci`, then `npm run agent:migrate` using the preview database. Migrations create only the `agent_*` tables and the append-only ledger trigger. Run migrations using a migration role; runtime role requires SELECT/INSERT on ledger and SELECT/INSERT/UPDATE/DELETE on state and limits. Revoke ledger UPDATE/DELETE and schema creation from runtime. The trigger also rejects ordinary ledger mutation.
3. Run `npm run test:agent`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run test:e2e`. GitHub CI provisions an isolated PostgreSQL service and Chromium.
4. Push the feature branch. Use the linked Vercel project's Git preview. Never use a production target or alias.
5. Smoke-test discovery, API, a real MCP client, authenticated A2A task creation/retrieval and inquiry idempotency against the exact preview commit. `/api/v1/readiness` returns 503 when persistent infrastructure is absent; this is a release blocker for the full platform.
6. Require CI success and review before any merge. Production deployment needs separate authorization.

The Docker alternative is `docker build -f Dockerfile.agent -t monika-agent .`. Run as the non-root built-in user, set PORT=3000 and connect to PostgreSQL. Source content is traced/copied into the standalone image. Container runtime has no GitHub write credentials. Docker builds have not been verified unless listed in the execution report.

## Synchronization and indexing

`npm run agent:sync` fetches public repositories, changed-repository releases and public authored PRs; PR detail establishes merged/closed/opened status and commit references. Successful results are atomic local snapshots. Retries are bounded, long rate-limit waits defer to the next run and failed sync preserves the previous snapshot. Search incompleteness is an error. A scheduled workflow prepares a review PR, never merges it. The GitHub App setting must permit workflow-created PRs. Snapshot PRs need review before publication.

`npm run agent:index` reuses embeddings whose record digest and model match, embeds changed documents and writes atomically. Runtime checks the whole-corpus digest; stale or unavailable embedding indexes fall back to lexical search. The prebuild hook rebuilds both language indexes automatically when the embedding key is configured. Use an approved secret-bearing branch for builds. No embedding service or live semantic-quality result should be claimed without that configuration. `node --import tsx scripts/agent-benchmark.ts` measures warm local corpus/search/QA costs.

`node --import tsx scripts/agent-revalidate.ts` performs bounded HEAD checks only against fixed public-source hosts. Redirects require review; they are never automatically followed. Results are stored separately from claims and audited.

## Retention, monitoring and recovery

Run `npm run agent:maintenance` daily with the runtime database. Tasks/message replays expire after 7 days; inquiries and submission keys after 30 days. Reads filter expired records even before cleanup. Audit contains identifiers, transitions and counts, never inquiry text, email, raw IPs, query strings, bearer tokens or retrieved source text. HMAC rate-limit subjects expire after about an hour through maintenance.

Structured `agent_request` logs contain route, method, status, latency and random request ID. `mcp_tool` logs include tool name, latency and success/failure. Aggregate counts/latencies by route; alert on 5xx >1% for five minutes, p95 >1s for public reads, readiness failures, sync staleness >48h, or elevated 429s. Configure the platform's log retention and drain according to the privacy policy before production. No analytics backend has been provisioned by these code changes.

Back up PostgreSQL with point-in-time recovery. Periodically export a ledger head to an independently controlled immutable store, then pass that hash as `head` when checking `/api/v1/ledger/verify`. Without an external anchor, a privileged DB owner can replace or truncate the entire chain; the chain only detects inconsistent tampering. Do not publish inquiry state or a database backup. Restore into an isolated database, run chain verification and replay tests, then separately authorize any traffic change.

## Security boundaries

Only fixed GitHub/OpenAI upstream origins are used by retrieval/sync. No user-supplied URL is fetched. MCP is public and read-only, with bounded schemas. A2A requires bearer authentication and durable task storage, disallows arbitrary actions and advertises neither streaming nor push notifications. Extractive QA returns source descriptions and explicit status rather than generating unsupported qualifications. Retrieved content is data, not executable instructions. Unknown questions abstain; keyword relevance is not an entailment proof.

Bodies are capped at 16 KiB while reading, errors are sanitized, API schemas reject unknown fields, and foreign browser origins are rejected. Edge infrastructure must overwrite X-Forwarded-For; clients must not be allowed to forge it. Configure durable limits and network-level request timeouts in production. TLS and HSTS should be enforced at the hosting edge. A CSP must be validated against the existing site's scripts/analytics before enforcement; no untested CSP is imposed on the visual site.

Rotate each token independently and review task-owner implications. Do not put secrets in NEXT_PUBLIC variables. Review dependency-scan output and semantic/search evaluation before releasing. Machine-readable identity never exposes inbox, calendar, private repository or infrastructure data.
