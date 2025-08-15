"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import LabelGrid from "./LabelGrid";

export default function LabelsOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-0 z-[9998] grid place-items-center overflow-y-auto"
      style={{ background: "#F4EEE8" }}
      role="dialog"
      aria-modal="true"
      aria-label="Focus labels"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl mx-auto px-6 py-12 grid place-items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <LabelGrid />
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 rounded-md px-2 py-1 text-sm text-blue-700 border border-blue-600/40 bg-white/70 shadow-sm"
        aria-label="Close overlay"
      >
        Close
      </button>
    </motion.section>
  );
}
