"use client";

import { useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  to?: string;          // "/blog" or "#blog"
  xThreshold?: number;  // how many px you must drag left (touch)
  vThreshold?: number;  // minimum velocity
  wheelThreshold?: number; // deltaX threshold for touchpad
};

export default function HeroSwipeLink({
  children,
  to = "/blog",
  xThreshold = 80,
  vThreshold = 0.3,
  wheelThreshold = -80,
}: Props) {
  const router = useRouter();
  const triggeredRef = useRef<boolean>(false);

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
  const onPanEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info; // offset.x negative = left
    if (offset.x <= -xThreshold && Math.abs(velocity.x) >= vThreshold) {
      go();
    }
  };

  // trackpad: horizontal gesture (deltaX < 0 = left)
  const onWheel = (e: React.WheelEvent) => {
    // ignore vertical scroll, react only to significant left swipe
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.deltaX <= wheelThreshold) {
      go();
    }
  };

  // keyboard accessibility fallback (Left Arrow)
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
      dragConstraints={{ left: 0, right: 0 }} // horizontal gesture only, without UI shift
      dragElastic={0.15}
      className="outline-none"
      aria-label="Swipe left to open blog posts"
    >
      {children}
    </motion.div>
  );
}
