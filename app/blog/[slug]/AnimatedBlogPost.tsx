// app/blog/[slug]/AnimatedBlogPost.tsx
"use client";

import React from "react";
import Markdown from "react-markdown";
import ArticleHeader from "@/components/ArticleHeader";
import Link from "next/link";
import { motion } from "framer-motion";
import ResourceIcons, { type Resource as ResourceItem } from "@/components/ResourceIcons";
import TLDR from "@/components/TLDR";

interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
  resources?: ResourceItem[];
  citations?: number;
  tldr?: string;
}

interface AnimatedBlogPostProps {
  meta: PostMeta;
  content: string;
}

export default function AnimatedBlogPost({ meta, content }: AnimatedBlogPostProps) {
  return (
    <motion.div
      className="overflow-x-hidden min-h-screen bg-gradient-to-br from-[#fef8f3] to-[#f9f5ef] font-sans text-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-16 sm:px-12 max-sm:px-8">
        <div className="max-w-[800px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <ArticleHeader />
          </motion.div>

          <motion.hr className="border-gray-200 dark:border-gray-700 my-8" initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />

          {/* TAGS */}
          <div className="flex flex-wrap justify-center mb-2" style={{ gap: "8px" }}>
            {(meta.tags || []).map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <Link
                  href={`/tags/${encodeURIComponent(tag)}`}
                  aria-label={`View all posts with tag: ${tag}`}
                  className="inline-block bg-[#004cff] px-3 py-1 text-[12px] font-semibold rounded-none"
                  style={{ color: "white" }}
                >
                  {tag}
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.main initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.0 }}>
            <h1 className="text-3xl font-light text-neutral-900 mb-3 text-center">{meta.title}</h1>

            {meta.resources?.length ? (
              <div className="flex justify-center mb-6">
                <ResourceIcons
                  resources={meta.resources}
                  showLabels={false}
                  className=""
                  sizeClassName="h-5 w-5"
                />
              </div>
            ) : null}

            {meta.tldr ? <TLDR text={meta.tldr} /> : null}


{/* MOBILE verze – jen na šířkách < 640px, má vnitřní okraje */}
<article className="block sm:hidden text-justify leading-[1.75] px-4">
  <Markdown
    components={{
      h1: ({ children }) => <h1 className="text-lg font-light text-neutral-900 mb-4 text-center">{children}</h1>,
      h2: ({ children }) => <h2 className="text-base font-light text-neutral-800 mb-3 text-center">{children}</h2>,
      p:  ({ children }) => <p className="text-sm text-neutral-900 leading-relaxed mb-3">{children}</p>,
      strong: ({ children }) => {
        const txt = React.Children.toArray(children).join("").toLowerCase();
        return txt === "neural" || txt === "natural law" ? <>{children}</> : <strong className="font-semibold text-neutral-900">{children}</strong>;
      },
    }}
  >
    {content}
  </Markdown>
</article>

<article className="hidden sm:block text-justify leading-[1.75]">
  <Markdown
    components={{
      h1: ({ children }) => <h1 className="text-lg font-light text-neutral-900 mb-4 text-center">{children}</h1>,
      h2: ({ children }) => <h2 className="text-base font-light text-neutral-800 mb-3 text-center">{children}</h2>,
      p:  ({ children }) => <p className="text-sm text-neutral-900 leading-relaxed mb-3">{children}</p>,
      strong: ({ children }) => {
        const txt = React.Children.toArray(children).join("").toLowerCase();
        return txt === "neural" || txt === "natural law" ? <>{children}</> : <strong className="font-semibold text-neutral-900">{children}</strong>;
      },
    }}
  >
    {content}
  </Markdown>
</article>



            {/* lokální CSS jen pro mobilní okraje článku */}
            <style jsx>{`
              @media (max-width: 640px) {
                .article-content {
                  padding-left: 16px;
                  padding-right: 16px;
                }
              }
            `}</style>
          </motion.main>

          <motion.footer className="text-[10px] font-light text-neutral-900 py-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.2 }}>
            © 2025 Monika Dvorackova
          </motion.footer>
        </div>
      </div>
    </motion.div>
  );
}
