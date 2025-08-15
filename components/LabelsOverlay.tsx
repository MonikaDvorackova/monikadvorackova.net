// components/LabelsOverlay.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LabelGrid from "./LabelGrid";

export default function LabelsOverlay({ onClose }: { onClose: () => void }) {
  // ESC + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow || "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Swipe-down zavírání jen z horní "drag" zóny
  const touchStartY = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const onHandleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
    draggingRef.current = true; // aktivuj jen pokud uživatel začal na handle
  };

  const onHandleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const start = touchStartY.current;
    if (start == null) return;
    const dy = (e.touches[0]?.clientY ?? start) - start; // kladné = tah dolů
    if (dy > 22) onClose();
  };

  const onHandleTouchEnd = () => {
    draggingRef.current = false;
    touchStartY.current = null;
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.section
        key="labels-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] bg-black/40 md:bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-label="Focus labels"
        onClick={onClose}
      >
        {/* Sheet / Modal container */}
        <motion.div
          key="labels-sheet"
          initial={{ y: "100%", opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className={[
            "absolute inset-x-0 bottom-0",
            "bg-[#F4EEE8] dark:bg-neutral-900",
            "h-[90dvh] md:h-auto",
            "rounded-t-2xl md:rounded-2xl",
            "shadow-2xl",
            "md:inset-10 md:mx-auto md:max-w-5xl",
            "flex flex-col",
          ].join(" ")}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          onClick={(e) => e.stopPropagation()} // nepropagovat klik do backdropu
        >
          {/* Header (sticky) */}
          <div className="sticky top-0 z-10 bg-[#F4EEE8]/90 dark:bg-neutral-900/90 backdrop-blur border-b border-neutral-200/70 dark:border-neutral-800 px-4 pt-3 pb-2 md:rounded-t-2xl">
            <div className="mx-auto max-w-5xl">
              {/* Drag handle (jen tady řešíme swipe) */}
              <div
                className="md:hidden mx-auto mb-2 h-1.5 w-12 rounded-full bg-neutral-300"
                aria-hidden
                onTouchStart={onHandleTouchStart}
                onTouchMove={onHandleTouchMove}
                onTouchEnd={onHandleTouchEnd}
              />
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  Labels
                </h2>
                <button
                  onClick={onClose}
                  className="h-10 px-3 rounded-md border border-blue-600/40 bg-white/80 text-sm text-blue-700 hover:bg-white"
                  aria-label="Close overlay"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Content (scrolluje se uvnitř; tělo stránky je zamknuté) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 md:p-8">
            <div className="mx-auto w-full max-w-5xl">
              <LabelGrid />
            </div>
          </div>

          {/* Footer (volitelný) */}
          <div className="sticky bottom-0 bg-[#F4EEE8]/90 dark:bg-neutral-900/90 backdrop-blur border-t border-neutral-200/70 dark:border-neutral-800 px-4 py-3 md:rounded-b-2xl">
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Tap a label to toggle • Swipe down to close
            </div>
          </div>
        </motion.div>
      </motion.section>
    </AnimatePresence>
  );
}
