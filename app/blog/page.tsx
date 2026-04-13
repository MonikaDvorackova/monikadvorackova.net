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
    if (!raw || !["govai", "software"].includes(raw)) return;
    requestAnimationFrame(() => {
      document.getElementById(raw)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isLoaded]);

  const softwarePosts = posts.filter((p) => p.type === "software");
  const articlePosts = posts.filter(
    (p) => p.type !== "software" && p.type !== "publication"
  );

  const hasSoftware = softwarePosts.length > 0;
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
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain py-6 sm:py-10 md:py-12">
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
                  <SectionLabel>Software</SectionLabel>
                  <SectionPanel>
                    <ClientBlog posts={softwarePosts} />
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

            {hasWritings && (
              <div className={`w-full${writingsTopPad ? " mt-7 sm:mt-10" : ""}`}>
                <motion.section
                  className="w-full"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <div className="w-full max-w-3xl mx-auto">
                    <SectionLabel>Writings</SectionLabel>
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
