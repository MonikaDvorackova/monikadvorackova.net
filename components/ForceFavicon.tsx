// components/ForceFavicon.tsx
"use client";

import { useEffect } from "react";

export default function ForceFavicon({ href }: { href: string }) {
  useEffect(() => {
    const id = "force-favicon-link";

    // Create or update our own <link rel="icon">
    let link = document.head.querySelector<HTMLLinkElement>(`link#${id}`);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "icon";
      link.type = "image/png";
      document.head.appendChild(link);
    }
    link.href = href;

    // Optional: ensure there's also a shortcut icon
    let shortcut = document.head.querySelector<HTMLLinkElement>("link[rel='shortcut icon']");
    if (!shortcut) {
      shortcut = document.createElement("link");
      shortcut.rel = "shortcut icon";
      document.head.appendChild(shortcut);
    }
    shortcut.href = href;
  }, [href]);

  return null;
}
