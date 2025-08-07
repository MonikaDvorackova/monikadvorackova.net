// app/blog/layout.tsx

import { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc] text-neutral-900">
      {children}
    </div>
  );
}
