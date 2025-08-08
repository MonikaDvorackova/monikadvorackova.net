"use client";

import React from "react";
import Markdown from "react-markdown";
import ArticleHeader from "@/components/ArticleHeader";
import Link from "next/link";
import { motion } from "framer-motion";

interface PostMeta {
  title: string;
  date: string;
  tags?: string[];
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
      <div style={{ padding: "0 4rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
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

          {/* datum + hranaté štítky s mezerou pod datem */}
          <motion.div 
            className="flex flex-col items-center mt-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-sm text-neutral-800 mb-4">
              {meta.date}
            </div>
            <div className="flex flex-wrap justify-center mb-4">
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
                    className="inline-block bg-[#004cff] text-white px-3 py-1 text-[12px] font-semibold rounded-none"
                    style={{
                      marginRight: "0.5rem",
                      marginBottom: "0.5rem",
                      color: "white",
                    }}
                  >
                    {tag}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.main
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.0 }}
          >
            <h1 className="text-3xl font-light text-neutral-900 mb-6">
              {meta.title}
            </h1>
            <article style={{ textAlign: "justify", lineHeight: 1.75 }}>
              <Markdown
                components={{
                  strong: ({ children }) => {
                    const txt = React.Children.toArray(children)
                      .join("")
                      .toLowerCase();
                    return txt === "neural" || txt === "natural law" ? (
                      <>{children}</>
                    ) : (
                      <strong>{children}</strong>
                    );
                  },
                }}
              >
                {content}
              </Markdown>
            </article>
          </motion.main>

          <motion.footer 
            className="text-center text-xs text-gray-500 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            © 2025 Monika Dvorackova
          </motion.footer>
        </div>
      </div>
    </motion.div>
  );
} 