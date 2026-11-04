import Link from "next/link";
export const metadata = {
  title: "Agent integration documentation",
  alternates: { canonical: "https://monikadvorackova.net/agent/docs" },
};
export default function AgentDocs() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-base leading-7">
      <h1 className="text-3xl font-semibold">Agent integration</h1>
      <p>
        This platform exposes public professional knowledge with explicit
        provenance. Website claims remain self-reported unless linked evidence
        indicates source verification.
      </p>
      <h2 className="mt-8 text-2xl">REST API v1</h2>
      <p>
        <Link href="/openapi.json">OpenAPI 3.1 specification</Link>. Start with{" "}
        <Link href="/api/v1/profile">/api/v1/profile</Link>. Collections accept
        limit (1–100) and offset. Use lang=en or lang=cs. Original source
        language is retained when a translation is unavailable. Errors include a
        stable code and sanitized message.
      </p>
      <pre className="overflow-x-auto my-4">
        {'curl "https://monikadvorackova.net/api/v1/search?q=MLOps&lang=en"'}
      </pre>
      <h2 className="mt-8 text-2xl">MCP</h2>
      <p>
        Connect a Streamable HTTP client to /mcp. Read-only tools, resources and
        evidence-first review prompts are public. prepare_inquiry creates a
        draft and performs no delivery. Tool schemas are discoverable using
        tools/list. Accept application/json and text/event-stream.
      </p>
      <h2 className="mt-8 text-2xl">A2A</h2>
      <p>
        <Link href="/.well-known/agent-card.json">Agent card</Link>. This
        endpoint pins A2A 0.3.0 JSON-RPC. POST message/send, tasks/get or
        tasks/cancel to /a2a using an operator-issued bearer token. Tasks are
        isolated by credential and retained seven days. Completed tasks cannot
        restart or cancel. Streaming and push notifications are unsupported.
        Persistent storage must be configured.
      </p>
      <h2 className="mt-8 text-2xl">Evidence and exports</h2>
      <p>
        <Link href="/api/v1/evidence">Evidence records</Link>,{" "}
        <Link href="/api/v1/resume">JSON Resume</Link>,{" "}
        <Link href="/api/v1/citations">CSL-JSON</Link>,{" "}
        <Link href="/api/v1/citations?format=bibtex">BibTeX</Link>,{" "}
        <Link href="/agent/knowledge.jsonld">JSON-LD</Link>,{" "}
        <Link href="/feed.json">JSON Feed</Link>,{" "}
        <Link href="/feed.xml">RSS</Link>, <Link href="/atom.xml">Atom</Link>.
        SHA-256 validates record integrity and does not independently establish
        a claim&apos;s truth.
      </p>
      <h2 className="mt-8 text-2xl">Collaboration and privacy</h2>
      <p>
        Prepare drafts through /api/v1/inquiries/prepare. Storing an inquiry
        requires a bearer token, an Idempotency-Key and explicit consent.
        Categories: collaboration, speaking, research, consulting,
        technical_project. Messages expire after 30 days. Outbound delivery is
        disabled. Do not submit secrets or private third-party information.
      </p>
      <h2 className="mt-8 text-2xl">Compatibility</h2>
      <p>
        REST major version is in the URL. Additive fields are backward
        compatible; removals require a new major version. MCP SDK negotiation is
        authoritative. A2A version is pinned in its card. Readiness exposes
        configuration gaps. Rate limits return 429 with Retry-After.
      </p>
      <p className="mt-8">
        <Link href="/">Return to website</Link>
      </p>
    </main>
  );
}
