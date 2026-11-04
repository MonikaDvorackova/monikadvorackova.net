import { corpus, BASE, VERSION, structuredData, type Language } from "./model";
import { invoke } from "./service";
import { agentCard } from "./a2a";
import { openapi } from "./api";
import { language, observed, guard } from "./http";
const xml = (v: string) =>
  v.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export async function discovery(req: Request, name: string) {
  return observed(req, async () => {
    await guard(req, "discovery");
    const lang = language(req);
    const docs = await corpus(lang);
    let data: unknown;
    let type = "application/json";
    switch (name) {
      case "openapi.json":
        data = openapi();
        break;
      case "agent.json":
        data = {
          schemaVersion: VERSION,
          id: BASE + "/#agent",
          name: "Monika Dvořáčková",
          languages: ["en", "cs"],
          canonical: BASE,
          api: BASE + "/openapi.json",
          mcp: {
            url: BASE + "/mcp",
            transport: "streamable-http",
            authentication: "public read-only",
          },
          a2a: BASE + "/.well-known/agent-card.json",
          resume: BASE + "/api/v1/resume",
          contentPolicy:
            "Self-reported unless source verification is explicit.",
          outboundActions: false,
        };
        break;
      case "agent-card.json":
        data = agentCard();
        break;
      case "knowledge.jsonld":
        data = structuredData(docs);
        type = "application/ld+json";
        break;
      case "llms.txt":
        data =
          "# Monika Dvořáčková\n\n" +
          docs[0].description +
          "\n\n## Interfaces\n" +
          [
            "/llms-full.txt",
            "/openapi.json",
            "/mcp",
            "/.well-known/agent-card.json",
            "/api/v1/profile",
            "/api/v1/search",
            "/agent/docs",
          ]
            .map((p) => "- [" + p + "](" + BASE + p + ")")
            .join("\n") +
          "\n\nProfessional claims retain their evidence status. No autonomous external actions.\n";
        type = "text/plain";
        break;
      case "llms-full.txt":
      case "profile.md":
        data = await markdown(lang);
        type = name.endsWith(".md") ? "text/markdown" : "text/plain";
        break;
      case "feed.json":
        data = {
          version: "https://jsonfeed.org/version/1.1",
          title: "Monika Dvořáčková — updates",
          home_page_url: BASE,
          feed_url: BASE + "/feed.json",
          language: lang,
          items: docs
            .filter((d) => d.kind === "article" || d.kind === "publication")
            .map((d) => ({
              id: d.id,
              url: d.url,
              title: d.title,
              content_text: d.description,
              date_modified: d.updatedAt,
              language: d.language,
            })),
        };
        break;
      case "feed.xml":
      case "atom.xml": {
        const items = docs.filter(
          (d) => d.kind === "article" || d.kind === "publication",
        );
        const latest =
          items
            .map((d) => d.updatedAt)
            .sort()
            .at(-1) || "2026-11-04T00:00:00Z";
        if (name === "atom.xml") {
          type = "application/atom+xml";
          data =
            '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="' +
            lang +
            '"><id>' +
            BASE +
            "</id><title>Monika Dvořáčková</title><updated>" +
            latest +
            '</updated><link rel="self" href="' +
            BASE +
            '/atom.xml"/><author><name>Monika Dvořáčková</name></author>' +
            items
              .map(
                (d) =>
                  "<entry><id>" +
                  xml(d.id) +
                  "</id><title>" +
                  xml(d.title) +
                  "</title><updated>" +
                  d.updatedAt +
                  '</updated><link href="' +
                  xml(d.url) +
                  '"/><summary>' +
                  xml(d.description) +
                  "</summary></entry>",
              )
              .join("") +
            "</feed>";
        } else {
          type = "application/rss+xml";
          data =
            '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Monika Dvořáčková</title><link>' +
            BASE +
            "</link><description>Professional writing and research</description><language>" +
            lang +
            "</language>" +
            items
              .map(
                (d) =>
                  '<item><guid isPermaLink="false">' +
                  xml(d.id) +
                  "</guid><title>" +
                  xml(d.title) +
                  "</title><link>" +
                  xml(d.url) +
                  "</link><description>" +
                  xml(d.description) +
                  "</description><pubDate>" +
                  new Date(d.updatedAt).toUTCString() +
                  "</pubDate></item>",
              )
              .join("") +
            "</channel></rss>";
        }
        break;
      }
      default:
        data = await invoke("get_profile", { lang });
    }
    return new Response(
      typeof data === "string" ? data : JSON.stringify(data),
      {
        headers: {
          "Content-Type": type + "; charset=utf-8",
          "Content-Language": lang,
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          Vary: "Accept-Language",
          "X-Content-Type-Options": "nosniff",
          Link: "<" + BASE + '/llms.txt>; rel="describedby"',
        },
      },
    );
  });
}
export async function markdown(lang: Language) {
  const docs = await corpus(lang);
  return (
    "# Monika Dvořáčková\n\n" +
    docs
      .map(
        (d) =>
          "## " +
          d.title +
          "\n\n" +
          d.description +
          "\n\n" +
          (d.kind === "article" || d.kind === "project"
            ? d.body + "\n\n"
            : "") +
          "Source: " +
          d.source +
          "\nEvidence status: " +
          d.status +
          "\nStable ID: " +
          d.id +
          "\n",
      )
      .join("\n")
  );
}
