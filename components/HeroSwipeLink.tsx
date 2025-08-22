"use client";

import { useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  to?: string;        // "/blog" nebo "#blog"
  xThreshold?: number; // kolik px musíš „odtáhnout“ doleva (touch)
  vThreshold?: number; // minimální rychlost
  wheelThreshold?: number; // deltaX pro touchpad
};

export default function HeroSwipeLink({
  children,
  to = "/blog",
  xThreshold = 80,
  vThreshold = 0.3,
  wheelThreshold = -80,
}: Props) {
  const router = useRouter();
  const triggeredRef = useRef(false);

  const go = () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    if (to.startsWith("#")) {
      const el = document.querySelector(to);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(to);
    }
  };

  // touch/mouse drag (Framer Motion)
  const onPanEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info; // offset.x záporný = doleva
    if (offset.x <= -xThreshold && Math.abs(velocity.x) >= vThreshold) {
      go();
    }
  };

  // trackpad: horizontální gesto (deltaX < 0 = doleva)
  const onWheel = (e: React.WheelEvent) => {
    // ignoruj vertikální scroll, reaguj jen na výrazný posun doleva
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.deltaX <= wheelThreshold) {
      go();
    }
  };

  // klávesnice jako přístupnostní fallback (šipka vlevo)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go();
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      onPanEnd={onPanEnd}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }} // jen horizontální gesto, bez posunu UI
      dragElastic={0.15}
      className="outline-none"
      aria-label="Swipe left to open blog posts"
    >
      {children}
    </motion.div>
  );
}
