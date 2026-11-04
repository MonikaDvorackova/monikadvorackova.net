export type PublicationItem = {
  id: string;
  title: string;
  blurb: string;
  outlet: string;
  /** Optional publisher brand mark displayed on the publication card. */
  outletLogo?: string;
  /** Optional; omit until a public URL exists. */
  href?: string;
  date?: string;
  /** Small line under the date (e.g. "Forthcoming", "External"). */
  caption?: string;
  tags?: string[];
  /** Line under the title (e.g. publisher · format). */
  subtitle?: string;
  /** Override; otherwise estimated from title + subtitle + blurb (~200 wpm). */
  readingMinutes?: number;
};

/** Curated external publications (not MDX posts). */
export const PUBLICATIONS_DATA: PublicationItem[] = [
  {
    id: "jaike-auditability-2026",
    title:
      "Why Auditability Fails in Current Generative AI Systems: A Governance Perspective",
    subtitle: "JAIKE · Vol. 1, No. 2 · pp. 41–53",
    blurb:
      "Structural barriers to reconstructing generative AI decisions, and evidence-preservation requirements illustrated through AIGov’s Rust-based governance engine. DOI: 10.37819/Jaike.26.0013.",
    outlet: "JAIKE",
    href: "https://doi.org/10.37819/Jaike.26.0013",
    date: "2026",
    caption: "Published · Open access",
    tags: ["AI Governance", "Auditability", "Rust"],
  },
  {
    id: "oreilly-preservation-gap-2026",
    title:
      "The Preservation Gap in the AI Stack: Why Capability Is Advancing Faster Than Reconstructability",
    subtitle: "O’Reilly Radar · Research article",
    blurb:
      "Why AI systems need historical reconstructability, not just observability: preserving runtime bindings and dependency states as systems evolve. Introduces Orrery as a reference architecture.",
    outlet: "O’Reilly Radar",

    href: "https://www.oreilly.com/radar/the-preservation-gap-in-the-ai-stack-why-capability-is-advancing-faster-than-reconstructability/",
    date: "2026",
    caption: "Published",
    tags: ["AI Governance", "Auditability"],
  },
  {
    id: "wk-ai-act-commentary",
    title: "EU AI Act Commentary - Expert Insight",
    subtitle: "Wolters Kluwer · Legal Blog · Expert insight",
    blurb:
      "EU AI Act commentary for Wolters Kluwer. A related book is in preparation (2026).",
    outlet: "Wolters Kluwer",

    date: "2026",
    caption: "Forthcoming",
    tags: ["AI Act"],
  },
];
