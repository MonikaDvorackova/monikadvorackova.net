import Link from "next/link";
export const metadata = { title: "Writing & Speaking | Monika Dvořáčková" };
export default function WritingAndSpeaking() {
  return <main className="min-h-screen bg-[#faf9f7] px-6 py-20 text-zinc-900"><div className="mx-auto max-w-3xl">
    <Link href="/" className="text-sm underline underline-offset-4">Home</Link>
    <h1 className="mt-16 text-4xl font-semibold">Writing &amp; Speaking</h1>
    <p className="mt-5 text-zinc-600">Research, publications, and international technical workshops.</p>
    <div className="mt-12 grid gap-5 sm:grid-cols-2">
      <Link href="/blog" className="rounded-xl border border-zinc-200 p-6 hover:border-zinc-500"><h2 className="text-xl font-semibold">Writing</h2><p className="mt-2 text-sm text-zinc-600">Articles, research, and software.</p></Link>
      <Link href="/public-speaking" className="rounded-xl border border-zinc-200 p-6 hover:border-zinc-500"><h2 className="text-xl font-semibold">Speaking</h2><p className="mt-2 text-sm text-zinc-600">FEMINNO AI Academy · AI Assistants, RAG &amp; AI Agents · 27 October 2026</p></Link>
    </div>
  </div></main>;
}
