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

    const lock = (): void => {
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, COOLDOWN);
    };

    const openOverlay = (): void => {
      if (!open && !lockRef.current) {
        setOpen(true);
        lock();
      }
    };

    const closeOverlay = (): void => {
      if (open && !lockRef.current) {
        setOpen(false);
        lock();
      }
    };

    const onWheel = (e: WheelEvent): void => {
      if (lockRef.current) return;
      if (e.deltaY > 0) {
        openOverlay();
      } else if (e.deltaY < 0) {
        closeOverlay();
      }
    };

    const onTouchStart = (e: TouchEvent): void => {
      touchStartYRef.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e: TouchEvent): void => {
      if (lockRef.current) return;
      const start = touchStartYRef.current;
      if (start == null) return;
      const currentY = e.touches[0]?.clientY ?? start;
      const dy = start - currentY; // swipe up = +
      if (dy > 8) {
        openOverlay();
      } else if (dy < -8) {
        closeOverlay();
      }
    };

    const onKey = (e: KeyboardEvent): void => {
      if (lockRef.current) return;
      const k = e.key;
      if (k === "PageDown" || k === "ArrowDown" || k === " ") {
        openOverlay();
      } else if (k === "PageUp" || k === "ArrowUp" || k === "Escape") {
        closeOverlay();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open ? <LabelsOverlay onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>

      {/* Nenápadný toggler – když gesta na zařízení neodpálí eventy */}
      {!open ? (
        <button
          type="button"
          aria-label="Show focus labels"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] h-3 w-3 rounded-full bg-blue-600/80 hover:bg-blue-600 focus:outline-none"
          title="Open labels"
        />
      ) : null}
    </>,
    document.body
  );
}
