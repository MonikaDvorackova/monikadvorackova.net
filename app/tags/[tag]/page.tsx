import type { Metadata } from "next";
import Link from "next/link";
import { formatTagLabel } from "@/lib/formatTagLabel";
import { getAllPostsMeta, postHasTag, type PostMeta } from "@/lib/getAllPostsMeta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = { params: Promise<{ tag: string }> };

function excerpt(post: PostMeta): string {
  const d = post.description?.trim();
  const t = post.tldr?.trim();
  if (d) return d;
  if (t) return t;
  return "";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const raw = decodeURIComponent(tag);
  const label = formatTagLabel(raw) || raw;
  return {
    title: label,
    description: `All posts and software tagged “${label}”.`,
    openGraph: {
      title: `${label} — Tags`,
      description: `All posts and software tagged “${label}”.`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const all = await getAllPostsMeta();
  const filtered = all.filter((p) => postHasTag(p, decoded));
  const label = formatTagLabel(decoded) || decoded;

  return (
    <main className="page-gutter-x mx-auto w-full max-w-lg flex-1 py-8 sm:max-w-xl sm:py-10">
      <nav className="mb-6 text-center">
        <Link
          href="/blog"
          className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#004cff] hover:opacity-90"
        >
          ← Blog
        </Link>
      </nav>

      <h1 className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-black/35">
        Tag
      </h1>
      <p className="mt-2 text-center text-base font-bold text-black text-balance">{label}</p>
      <p className="mx-auto mt-2 max-w-md text-center text-[12px] leading-snug text-zinc-600">
        Everything on this site that shares this tag — one index instead of scanning the whole blog.
      </p>
      <p className="mx-auto mt-1 max-w-md text-center text-[11px] leading-snug text-zinc-500">
        {filtered.length === 0
          ? "No post uses this exact tag in frontmatter right now — check spelling or try another tag."
          : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
      </p>

      <ul className="mt-8 flex flex-col gap-4 pb-8">
        {filtered.map((post) => {
          const href = `/blog/${post.slug}`;
          const title = (post.cardTitle?.trim() || post.title).trim();
          const blurb = excerpt(post);
          return (
            <li key={post.slug}>
              <Link
                href={href}
                className="block rounded-2xl border border-[rgba(0,42,255,0.12)] bg-white/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(8,28,244,0.06),0_4px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 text-left text-[12px] font-bold leading-snug text-black">
                    {title}
                  </span>
                  <span className="shrink-0 text-[9px] font-medium tabular-nums text-zinc-500">
                    {post.date}
                  </span>
                </div>
                {blurb ? (
                  <p className="mt-2 line-clamp-3 text-left text-[10px] leading-relaxed text-zinc-700">
                    {blurb}
                  </p>
                ) : null}
                <span className="mt-2 inline-block text-[9px] font-semibold text-[#004cff]">
                  Open →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
