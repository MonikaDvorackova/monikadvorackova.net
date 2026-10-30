import Link from "next/link";
import { getAllPostsMeta } from "@/lib/getAllPostsMeta";

export const metadata = {
  title: "Open Source Contributions",
  description: "Upstream contributions and monthly engineering notes by Monika Dvořáčková.",
};

export default async function OpenSourcePage() {
  const posts = (await getAllPostsMeta()).filter((post) => post.slug.startsWith("open-source-engineering-notes-"));
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16 text-neutral-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Engineering</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Open Source Contributions</h1>
      <p className="mt-5 text-base leading-7 text-neutral-600">
        A record of upstream changes, their technical context, and verification. Monthly notes link to original pull requests.
      </p>
      <div className="mt-10 space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-neutral-200 pb-6">
            <p className="text-sm text-neutral-500">{post.date}</p>
            <h2 className="mt-2 text-xl font-medium">
              <Link href={`/blog/${post.slug}`} className="underline underline-offset-4 hover:no-underline">{post.title}</Link>
            </h2>
            {post.description && <p className="mt-2 text-neutral-600">{post.description}</p>}
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-neutral-500">Source: <a className="underline" href="https://github.com/MonikaDvorackova">GitHub profile</a></p>
    </main>
  );
}
