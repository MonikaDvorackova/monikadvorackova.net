// components/ForceFavicon.tsx
"use client";

import { useEffect } from "react";

type Props = {
  href: string;
};

export default function ForceFavicon({ href }: Props) {
  useEffect(() => {
    const existing = document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
    existing.forEach(el => el.parentNode?.removeChild(el));


    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = href;
    document.head.appendChild(link);


    const shortcut = document.createElement("link");
    shortcut.rel = "shortcut icon";
    shortcut.href = href;
    document.head.appendChild(shortcut);


    console.log(
      "[ForceFavicon] links:",
      [...document.head.querySelectorAll('link[rel~=\"icon\"]')].map(l => l.outerHTML)
    );
  }, [href]);

  return null;
}
