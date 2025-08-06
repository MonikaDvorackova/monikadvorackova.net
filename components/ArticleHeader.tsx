// components/ArticleHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TITLES = [
  "From Code to Compliance",
  "Neural & Natural Law",
  "Machines & Mandates",
];

export default function ArticleHeader() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % TITLES.length), 4000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="text-center px-8 sm:px-10 lg:px-12 pt-20">
      <AnimatePresence mode="wait">
        <motion.h1
          key={TITLES[idx]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.6 }}
          style={{ fontWeight: 200 }}    // přímo inline styl pro lehkou váhu písma
          className="text-sm text-gray-900 dark:text-gray-100 font-sans"
        >
          {TITLES[idx]}
        </motion.h1>
      </AnimatePresence>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-4 text-sm italic text-neutral-600 dark:text-neutral-400"
      >
        Thoughts &amp; analysis on AI, law, and everything between.
      </motion.p>
    </div>
  );
}
