import Link from "next/link";

export const metadata = {
  title: "Public Speaking | Monika Dvořáčková",
  description: "International technical workshops and speaking engagements in AI.",
};

export default function PublicSpeakingPage() {
  return (
    <main className="min-h-screen bg-[#faf9f7] px-6 py-20 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm underline underline-offset-4">Home</Link>
        <p className="mt-16 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Public Speaking &amp; Teaching</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">International workshops</h1>
        <article className="mt-12 border-t border-zinc-200 pt-8">
          <p className="text-sm text-zinc-500">27 October 2026 · FEMINNO AI Academy · Armenia · Online</p>
          <h2 className="mt-3 text-2xl font-semibold">AI Assistants, RAG &amp; AI Agents</h2>
          <p className="mt-3 text-sm font-medium text-zinc-600">Guest Lecturer · Technical Workshop Instructor</p>
          <p className="mt-5 leading-7 text-zinc-700">
            Delivered a hands-on technical workshop on AI assistants, Retrieval-Augmented Generation (RAG),
            and AI agents for FEMINNO AI Academy, an international educational initiative supporting
            young women in Armenia. The session covered knowledge retrieval, evidence-grounded responses,
            agentic workflows, hallucination risks, and practical approaches to reliable AI applications.
          </p>
          <p className="mt-5 text-sm text-zinc-500">LLMs · RAG · AI Agents · Responsible AI</p>
        </article>
      </div>
    </main>
  );
}
