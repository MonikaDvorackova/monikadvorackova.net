"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import LabelsOverlay from "./LabelsOverlay";

export default function LabelsController() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const lockRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const COOLDOWN = 350;

    const lock = () => {
      lockRef.current = true;
      window.setTimeout(() => (lockRef.current = false), COOLDOWN);
    };

    const onWheel = (e: WheelEvent) => {
      if (lockRef.current) return;
      if (e.deltaY > 0 && !open) {
        setOpen(true);
        lock();
      } else if (e.deltaY < 0 && open) {
        setOpen(false);
        lock();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (lockRef.current) return;
      const start = touchStartYRef.current;
      if (start == null) return;
      const dy = start - e.touches[0].clientY; // swipe up = +
      if (dy > 8 && !open) {
        setOpen(true);
        lock();
      } else if (dy < -8 && open) {
        setOpen(false);
        lock();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (lockRef.current) return;
      if ((e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") && !open) {
        setOpen(true);
        lock();
      } else if ((e.key === "ArrowUp" || e.key === "PageUp" || e.key === "Escape") && open) {
        setOpen(false);
        lock();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("touchstart", onTouchStart as any);
      window.removeEventListener("touchmove", onTouchMove as any);
      window.removeEventListener("keydown", onKey as any);
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open && <LabelsOverlay onClose={() => setOpen(false)} />}
      </AnimatePresence>

      {/* Nenápadný toggler – pro případ, že gesta na zařízení neodpálí eventy */}
      {!open && (
        <button
          type="button"
          aria-label="Show focus labels"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] h-3 w-3 rounded-full bg-blue-600/80 hover:bg-blue-600 focus:outline-none"
          title="Open labels"
        />
      )}
    </>,
    document.body
  );
}
