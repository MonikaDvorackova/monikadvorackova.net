"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ClientBlog from "@/components/ClientBlog";
import PublicationsList, { PUBLICATIONS_DATA } from "@/components/PublicationsList";
import WritingList from "@/components/WritingList";

type ResourceType =
  | "github" | "arxiv" | "wandb" | "mlflow" | "model" | "website"
  | "pdf" | "dataset" | "demo" | "colab" | "kaggle";

type Resource = { type: ResourceType; href: string; label?: string };

interface Post {
  slug: string;
  title: string;
  cardTitle?: string;
  description?: string;
  date: string;
  tags: string[];
  tldr?: string;
  resources?: Resource[];
  readingMinutes?: number;
  type: string;
}

function isResourceArray(v: unknown): v is Resource[] {
  return Array.isArray(v) && v.every(
    (r) =>
      r &&
      typeof r === "object" &&
      typeof (r as Resource).type === "string" &&
      typeof (r as Resource).href === "string"
  );
}

function normalizePosts(data: unknown): Post[] {
  if (!Array.isArray(data)) return [];
  const out: Post[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.slug !== "string" || typeof obj.title !== "string") continue;
    out.push({
      slug: obj.slug,
      title: obj.title,
      cardTitle: typeof obj.cardTitle === "string" ? obj.cardTitle : undefined,
      description: typeof obj.description === "string" ? obj.description : undefined,
      date: typeof obj.date === "string" ? obj.date : "",
      tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
      tldr: typeof obj.tldr === "string" ? obj.tldr : undefined,
      resources: isResourceArray(obj.resources) ? obj.resources : undefined,
      readingMinutes:
        typeof obj.readingMinutes === "number" ? obj.readingMinutes : undefined,
      type: typeof obj.type === "string" ? obj.type : "article",
    });
  }
  return Array.from(new Map(out.map((p) => [p.slug, p])).values());
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full pb-2 sm:pb-3">
      <div className="text-center text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] uppercase text-black/35">
        {children}
      </div>
    </div>
  );
}

function SectionPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-visible rounded-2xl bg-white/35 py-3 backdrop-blur-sm sm:py-5"
      style={{
        marginTop: 10,
        paddingLeft: "clamp(0.65rem, 2vw, 1.25rem)",
        paddingRight: "clamp(0.65rem, 2vw, 1.25rem)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.5), 0 6px 28px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`GET /api/posts failed: ${res.status} ${text}`);
        }
        const text = await res.text();
        if (!text.trim()) return [];
        try {
          return JSON.parse(text) as unknown;
        } catch (e) {
          console.error("GET /api/posts: invalid or empty JSON", e);
          return [];
        }
      })
      .then((data) => {
        setPosts(normalizePosts(data));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setTimeout(() => setIsLoaded(true), 300);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw || !["aigov", "software"].includes(raw)) return;
    requestAnimationFrame(() => {
      document.getElementById(raw)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isLoaded]);

  const softwarePosts = posts.filter((p) => p.type === "software");
  const articlePosts = posts.filter(
    (p) => p.type !== "software" && p.type !== "publication"
  );

  const hasSoftware = true;
  const hasPublications = PUBLICATIONS_DATA.length > 0;
  const hasWritings = articlePosts.length > 0;
  const publicationsTopPad = hasSoftware;
  const writingsTopPad = hasSoftware || hasPublications;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden w-full text-neutral-900">
      <motion.div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden py-6 sm:py-10 md:py-12">
          <div className="page-gutter-x w-full max-w-5xl mx-auto flex flex-col pb-6 sm:pb-10">
            {hasSoftware && (
              <motion.section
                id="software"
                className="w-full scroll-mt-20"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="w-full max-w-3xl mx-auto">
                  <SectionLabel>Research &amp; Software</SectionLabel>
                  <SectionPanel>
                    <ClientBlog posts={softwarePosts} extras={[
                      { slug: "aigov-core-external", title: "AIGov Core", date: "2026", tags: ["Open Source", "Rust", "AI Governance"], description: "Rust engine: append-only decision evidence, policy evaluation, deterministic governance replay, audit exports and verification endpoints.", externalHref: "https://github.com/AIGovDev/aigov-core" },
                      { slug: "decision-reconstructability-research", title: "Decision Reconstructability Research", date: "2026", tags: ["Research", "Auditability"], description: "Published JAIKE paper (DOI: 10.37819/Jaike.26.0013): explains why model outputs alone cannot reconstruct decisions and identifies decision-time evidence needed for audit.", externalHref: "https://doi.org/10.37819/Jaike.26.0013" },
                      { slug: "huggingface-evaluate-lazy-imports", title: "Hugging Face Evaluate — faster imports (PR #833)", date: "2026", tags: ["Open Source", "Python", "Performance"], description: "Lazy loading reduced plain import evaluate from 1.419 s to 0.024 s (about 59×) in a local benchmark; 11 regression tests passed. Other imports vary.", externalHref: "https://github.com/huggingface/evaluate/pull/833" },
                      { slug: "huggingface-datasets-fsspec-contribution", title: "Hugging Face Datasets — User-Agent fix (PR #8866)", date: "2026", tags: ["Open Source", "Python", "fsspec"], description: "PR #8866: fixes custom User-Agent forwarding for HTTP/HTTPS via fsspec, preserves explicit headers and adds regression tests; 146 tests passed in local validation.", externalHref: "https://github.com/huggingface/datasets/pull/8866" }
                    ]} />
                  </SectionPanel>
                </div>
              </motion.section>
            )}

            {hasPublications && (
              <div
                className={`w-full${publicationsTopPad ? " mt-7 sm:mt-10" : ""}`}
              >
                <motion.section
                  className="w-full"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="w-full max-w-3xl mx-auto">
                    <SectionLabel>Publications</SectionLabel>
                    <SectionPanel>
                      <PublicationsList />
                      <section
                        id="finite-memory-hypothesis-testing"
                        aria-labelledby="finite-memory-heading"
                        className="mt-6 scroll-mt-20 border-t border-black/10 px-1 pt-5 sm:mt-8 sm:px-3 sm:pt-6"
                      >
                        <h2 id="finite-memory-heading" className="text-lg font-semibold tracking-tight text-neutral-900">
                          Finite-Memory Hypothesis Testing
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                          How much memory does a statistical test need when the data source has a hidden phase?
                          In this series of three manuscripts, I study what a finite-state observer can infer
                          from a stream of observations when it can retain only a limited internal state.
                        </p>
                        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-neutral-700 marker:font-medium">
                          <li>
                            <strong className="text-neutral-900">Randomization with four observations.</strong>{" "}
                            The first manuscript compares deterministic and randomized observers with three memory
                            states. It gives an exact four-observation example where randomized state transitions
                            improve the final test.
                          </li>
                          <li>
                            <strong className="text-neutral-900">Randomization at three and five observations.</strong>{" "}
                            The second manuscript compares the best deterministic three-state tests with explicit
                            randomized constructions at these two horizons and examines how the improvement depends
                            on the strength of the source bias.
                          </li>
                          <li>
                            <strong className="text-neutral-900">Memory for exact and approximate tests.</strong>{" "}
                            The third manuscript studies how the number of states needed for an exact test grows
                            with the observation horizon and how much memory suffices when a small loss in accuracy
                            is allowed.
                          </li>
                        </ol>
                        <h3 className="mt-5 text-sm font-semibold text-neutral-900">World Models</h3>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                          I am also exploring how learned dynamics models accumulate errors over multiple steps
                          and when those errors change the decisions a planner makes.
                        </p>
                      </section>
                    </SectionPanel>
                  </div>
                </motion.section>
              </div>
            )}

            {true && (
              <div className={`w-full${writingsTopPad ? " mt-7 sm:mt-10" : ""}`}>
                <motion.section
                  className="w-full"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <div className="w-full max-w-3xl mx-auto">
                    <SectionLabel>Writing &amp; Speaking</SectionLabel>
                    <SectionPanel>
                      <WritingList posts={articlePosts} />
                    </SectionPanel>
                  </div>
                </motion.section>
              </div>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  );
}
