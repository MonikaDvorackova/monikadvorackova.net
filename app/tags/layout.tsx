import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
  description: "Posts and software by tag.",
};

export default function TagsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh min-h-0 flex-col overflow-x-hidden bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc] text-neutral-900">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      <footer className="shrink-0 border-t border-black/10 bg-[rgba(253,242,233,0.92)] py-3 text-center text-[10px] font-light leading-snug text-neutral-600">
        © 2026 Monika Dvorackova
      </footer>
    </div>
  );
}
