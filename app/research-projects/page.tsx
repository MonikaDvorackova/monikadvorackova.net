import Link from "next/link";

export const metadata = {
  title: "Research Engineering Projects | Monika Dvořáčková",
  description: "Open-source reference implementations for trustworthy AI, world models, causal inference, agent reliability, and verifiable ML systems.",
};

const projects = [
  { name: "Agent Reliability Bench", slug: "agent-reliability-bench", category: "Trustworthy AI", description: "Deterministic tool-trace protocol evaluation, JSONL batch reports, and statistical confidence intervals.", demo: "https://monikadvorackova.github.io/agent-reliability-bench/" },
  { name: "World Models Lab", slug: "world-models-lab", category: "World models", description: "Linear latent-dynamics system identification and multi-step rollout evaluation against a persistence baseline." },
  { name: "Formal AI Verification", slug: "formal-ai-verification", category: "AI governance", description: "Rust policy gates, temporal event monitoring, and SMT counterexample checks." },
  { name: "Causal ML Benchmarks", slug: "causal-ml-benchmarks", category: "Causal inference", description: "Stratified adjustment, inverse propensity weighting, and seeded bootstrap intervals." },
  { name: "Neurosymbolic Reasoning", slug: "neurosymbolic-reasoning", category: "Neuro-symbolic systems", description: "Positive Horn-rule inference with deterministic derivation provenance." },
  { name: "ML Systems Engineering", slug: "ml-systems-engineering", category: "ML infrastructure", description: "C++ matrix kernels, blocked multiplication, and reference correctness tests." },
] as const;

export default function ResearchProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-16 text-neutral-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Open source · Research engineering</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Trustworthy AI &amp; Reliable ML Systems</h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600">
        Six public, reproducible reference implementations exploring agent reliability, world-model evaluation,
        causal inference, symbolic reasoning, numerical systems, and governance verification.
        These are engineering baselines, not production-certified or peer-reviewed research results.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {projects.map((project) => (
          <article key={project.slug} className="rounded-xl border border-neutral-200 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{project.category}</p>
            <h2 className="mt-2 text-xl font-semibold">{project.name}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{project.description}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a className="underline underline-offset-4" href={`https://github.com/MonikaDvorackova/${project.slug}`} target="_blank" rel="noopener noreferrer">Source &amp; tests</a>
              {"demo" in project && <a className="underline underline-offset-4" href={project.demo} target="_blank" rel="noopener noreferrer">Live demo</a>}
            </div>
          </article>
        ))}
      </div>
      <p className="mt-10 text-sm text-neutral-600">
        See also <Link className="underline underline-offset-4" href="/open-source">upstream open-source contributions</Link>.
        Issues, independent reproductions, and technically scoped contributions are welcome.
      </p>
    </main>
  );
}
