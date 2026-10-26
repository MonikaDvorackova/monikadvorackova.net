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
                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <a href="https://github.com/AIGovDev/aigov-core" target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col rounded-2xl border border-[#004cff]/15 bg-white/75 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#004cff]/40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004cff] transition-all">
                        <div className="text-[9px] font-semibold uppercase tracking-wider text-[#004cff]">Open Source · Rust</div>
                        <h3 className="mt-1 text-sm font-semibold">AIGov Core</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">Versioned decision evidence, policy evaluation, deterministic governance replay and audit verification.</p>
                        <span className="mt-auto pt-3 inline-block text-[10px] font-semibold text-[#004cff]">View GitHub ↗</span>
                      </a>
                      <a href="https://doi.org/10.37819/Jaike.26.0013" target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col rounded-2xl border border-[#004cff]/15 bg-white/75 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#004cff]/40 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004cff] transition-all">
                        <div className="text-[9px] font-semibold uppercase tracking-wider text-[#004cff]">Research · Published</div>
                        <h3 className="mt-1 text-sm font-semibold">Decision Reconstructability Research</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">Research into decision-time evidence preservation, dependency changes and the limits of replay. The linked publication explains the methodology and governance implications.</p>
                        <span className="mt-2 inline-block text-[10px] font-semibold text-[#004cff]">Read paper ↗</span>
                      </a>
                    </div>
                    <ClientBlog posts={softwarePosts} />
                    <div className="mt-5 border-t border-black/10 pt-4">
                      <h3 className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55">Open Source Contributions</h3>
                      <a href="https://github.com/huggingface/datasets/pull/8866" target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2 rounded-2xl border border-[#004cff]/15 bg-white/75 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all hover:border-[#004cff]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004cff]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold">Hugging Face · Datasets</span>
                          <span className="rounded-full bg-[#004cff]/10 px-2 py-1 text-[9px] font-semibold text-[#004cff]">External PR #8866</span>
                        </div>
                        <p className="text-xs font-semibold">Fix forwarding custom User-Agent to fsspec HTTP requests</p>
                        <p className="text-[11px] leading-relaxed text-zinc-600">Propagates configured User-Agent headers for HTTP/HTTPS dataset requests, preserves explicitly set headers and adds regression tests.</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500"><span>Python</span><span>·</span><span>HTTP</span><span>·</span><span>fsspec</span><span>·</span><span>Tests</span></div>
                        <span className="text-[10px] font-semibold text-[#004cff]">View pull request ↗</span>
                      </a>
                      <a href="https://github.com/monikadvorackova" target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-[11px] font-semibold text-[#004cff] hover:underline">More contributions on GitHub ↗</a>
                    </div>

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
