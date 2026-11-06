import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research | Monika Dvořáčková",
  description: "Selected research and technical writing on reliable ML systems, decision reconstructability and AI governance.",
};

export default function ResearchPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16 text-neutral-900">
      <Link className="text-sm underline" href="/">Home</Link>
      <h1 className="mt-10 text-4xl font-semibold">Research & publications</h1>
      <p className="mt-5 leading-7">I work on reliable machine learning systems, decision reconstructability, audit evidence and AI governance engineering. The entries below distinguish published work from ongoing research.</p>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Published work</h2>
        <article className="mt-5 border-t border-neutral-300 pt-5">
          <h3 className="text-lg font-medium">Decision reconstructability research</h3>
          <p className="mt-2 text-sm">JAIKE · DOI: 10.37819/Jaike.26.0013</p>
          <p className="mt-2">On the decision-time evidence required to reconstruct and audit ML-assisted decisions.</p>
          <a className="mt-3 inline-block underline" href="https://doi.org/10.37819/Jaike.26.0013">Publication record</a>
        </article>
        <article className="mt-6 border-t border-neutral-300 pt-5">
          <h3 className="text-lg font-medium">The Preservation Gap in the AI Stack: Why Capability Is Advancing Faster Than Reconstructability</h3>
          <p className="mt-2 text-sm">O’Reilly Radar · Technical article · 2026 (not a peer-reviewed paper)</p>
          <a className="mt-3 inline-block underline" href="https://www.oreilly.com/radar/">O’Reilly Radar</a>
        </article>
      </section>
      <section className="mt-12 border-t border-neutral-300 pt-6">
        <h2 className="text-2xl font-semibold">Research in progress</h2>
        <p className="mt-3">Current research interests include evidence-based AI governance, production ML traceability and reliable ML pipelines. Works under review or in preparation are not listed as accepted publications.</p>
      </section>
      <Link className="mt-10 inline-block underline" href="/open-source">Selected open-source contributions</Link>
    </main>
  );
}
