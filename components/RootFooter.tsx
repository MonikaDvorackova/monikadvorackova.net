"use client";

import { usePathname } from "next/navigation";

/**
 * Fixed site footer for non-blog routes. Hidden whenever pathname starts with `/blog`
 * (listing, `/blog/[slug]`, and any future nested segment under blog).
 * Blog copyright: `app/blog/layout.tsx` only.
 */
export default function RootFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/blog")) {
    return null;
  }

  return (
    <footer
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        borderTop: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(253, 242, 233, 0.82)",
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
        textAlign: "center",
        padding: "10px 12px",
        fontSize: 10,
        color: "rgba(0,0,0,0.70)",
        lineHeight: 1.2,
        pointerEvents: "none",
      }}
    >
      © 2026 Monika Dvořáčková
    </footer>
  );
}
