// app/blog/[slug]/AnimatedBlogPost.tsx
"use client";

import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ArticleHeader from "@/components/ArticleHeader";
import Link from "next/link";
import { motion } from "framer-motion";
import ResourceIcons, { type Resource as ResourceItem } from "@/components/ResourceIcons";
import TLDR from "@/components/TLDR";
import MermaidBlock from "@/components/MermaidBlock";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

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

type CodeProps = React.HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

function extractText(children: React.ReactNode): string {
  return React.Children.toArray(children).join("").replace(/\n$/, "");
}

function MarkdownComponents() {
  return {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-base font-light text-neutral-900 mb-4 text-center">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-sm font-light text-neutral-800 mb-3 text-center">{children}</h2>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-xs text-neutral-900 leading-relaxed mb-3">{children}</p>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <table
        style={{
          margin: "1.5rem auto",
          width: "fit-content",
          borderCollapse: "collapse",
          background: "transparent",
        }}
      >
        {children}
      </table>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th style={{ border: "none", background: "transparent", padding: 0 }}>{children}</th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td style={{ border: "none", background: "transparent", padding: 0 }}>{children}</td>
    ),
    a: ({
      href,
      children,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) => {
      const url = href || "";
      const isGovAiRepo =
        url === "https://github.com/MonikaDvorackova/aigov-compliance-engine" ||
        url === "https://github.com/MonikaDvorackova/aigov-compliance-engine/";
      const isGovBase = url === "https://govbase.dev" || url === "https://govbase.dev/";

      if (isGovAiRepo || isGovBase) {
        const icon = isGovAiRepo ? (
          <FaGithub size={14} color="#171515" />
        ) : (
          <FaExternalLinkAlt size={12} color="#444444" />
        );

        return (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-mono font-bold text-[#2563eb] hover:underline"
            {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">)}
          >
            <span className="inline-flex" style={{ marginRight: 12 }}>
              {icon}
            </span>
            <span className="text-[0.85em]">{children}</span>
          </Link>
        );
      }

      return (
        <a href={url} {...props}>
          {children}
        </a>
      );
    },
    strong: ({ children }: { children?: React.ReactNode }) => {
      const txt = React.Children.toArray(children).join("").toLowerCase();
      return txt === "neural" || txt === "natural law" ? (
        <>{children}</>
      ) : (
        <strong className="font-semibold text-neutral-900">{children}</strong>
      );
    },
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match?.[1];
      const value = extractText(children);

      if (!inline && language === "mermaid") {
        return <MermaidBlock chart={value} />;
      }

      if (inline) {
        return (
          <code
            className="font-mono font-bold text-[0.88rem] leading-[1.65] text-[#2563eb]"
            style={{ fontWeight: 700 }}
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <pre
          className="my-6 overflow-x-auto"
          style={{ marginLeft: "auto", marginRight: "auto", width: "fit-content", maxWidth: "100%" }}
        >
          <code
            className="block whitespace-pre font-mono font-bold text-[0.88rem] leading-[1.65] text-[#2563eb]"
            style={{ fontWeight: 700 }}
            {...props}
          >
            {children}
          </code>
        </pre>
      );
    },
  };
}

export default function AnimatedBlogPost({ meta, content }: AnimatedBlogPostProps) {
  const components = MarkdownComponents();

  return (
    <motion.div
      className="overflow-x-hidden min-h-screen bg-gradient-to-br from-[#fef8f3] to-[#f9f5ef] font-sans text-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="page-gutter-x">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ArticleHeader />
          </motion.div>

          <motion.hr
            className="border-gray-200 dark:border-gray-700 my-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

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
                  className="inline-block bg-[#004cff] px-3 py-1 text-[11px] font-semibold rounded-none"
                  style={{ color: "white" }}
                >
                  {tag}
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.main
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0 }}
          >
            <h1 className="text-2xl font-light text-neutral-900 mb-3 text-center">
              {meta.title}
            </h1>

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

            {meta.tldr ? (
              <div className="mobile-pad">
                <TLDR text={meta.tldr} />
              </div>
            ) : null}

            <article className="text-justify leading-[1.75]">
              <div className="mobile-pad">
                <Markdown remarkPlugins={[remarkGfm]} components={components}>
                  {content}
                </Markdown>
              </div>

              <style jsx global>{`
                .mobile-pad {
                  box-sizing: border-box;
                  width: 100%;
                  margin: 0 auto;
                }

                .mobile-pad img,
                .mobile-pad video,
                .mobile-pad pre,
                .mobile-pad code,
                .mobile-pad table {
                  max-width: 100%;
                  overflow-wrap: anywhere;
                }

                .mermaid-rendered svg {
                  max-width: 100%;
                  height: auto;
                }
              `}</style>
            </article>
          </motion.main>

          <motion.footer
            className="text-[9px] font-light text-neutral-900 py-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            © 2026 Monika Dvorackova
          </motion.footer>
        </div>
      </div>
    </motion.div>
  );
}