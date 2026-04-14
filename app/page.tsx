// app/page.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaLinkedin,
  FaGithub,
  FaCalendarAlt,
  FaEnvelope,
  FaFileAlt,
} from "react-icons/fa";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  FiCpu,
  FiSearch,
  FiServer,
  FiShield,
  FiBarChart2,
  FiBookOpen,
} from "react-icons/fi";
import ArxivIcon from "../components/ArxivIcon";
import { useRouter } from "next/navigation";

type HeroChunk = { readonly slot: string; readonly text: string };

type HeroFrame = {
  readonly line1: readonly HeroChunk[];
  readonly line2: readonly HeroChunk[];
  readonly line3: readonly HeroChunk[];
};

const heroL = (slot: string, text: string): readonly HeroChunk[] => [{ slot, text }];

/** Tight line1 so it usually stays one wrapped row; len(line1) > len(line2) > len(line3). */
const HERO_SCENES: readonly HeroFrame[] = [
  {
    line1: heroL(
      "s0-1",
      "ML and LLM engineer — prod deploys, drift checks, on-call ownership."
    ),
    line2: heroL(
      "s0-2",
      "I consult on architecture, integration, and operator handover."
    ),
    line3: heroL("s0-3", "Hands-on delivery."),
  },
  {
    line1: heroL(
      "s1-1",
      "I build pipelines and registries; batch and online inference under agreed SLAs."
    ),
    line2: heroL(
      "s1-2",
      "Skew and outages: mitigations in code, config, runbooks—not slides."
    ),
    line3: heroL("s1-3", "Production ML."),
  },
  {
    line1: heroL(
      "s2-1",
      "I engineer LLM features: prompts, eval harnesses, guardrails, CI gates before traffic."
    ),
    line2: heroL(
      "s2-2",
      "I stop regressions on cost, latency, or behavior before users see them."
    ),
    line3: heroL("s2-3", "LLMs I certify."),
  },
  {
    line1: heroL(
      "s3-1",
      "Metrics, logs, MLOps dashboards, named owners — wired per live model."
    ),
    line2: heroL(
      "s3-2",
      "Drift checks, deploy validation, alerts with runbook steps."
    ),
    line3: heroL("s3-3", "Observable ML."),
  },
  {
    line1: heroL(
      "s4-1",
      "Governance packs: risk, policy, docs, owners, records, audit-ready evidence."
    ),
    line2: heroL(
      "s4-2",
      "Audit lines mapped to system, release, engineer on record."
    ),
    line3: heroL("s4-3", "GRC-ready delivery."),
  },
  {
    line1: heroL(
      "s5-1",
      "EU AI Act: classification, technical files, conformity for ML and LLM in scope."
    ),
    line2: heroL(
      "s5-2",
      "Law and guidance tied to repos, APIs, live deployments."
    ),
    line3: heroL("s5-3", "Law-aware compliance."),
  },
  {
    line1: heroL(
      "s6-1",
      "I teach LLMs, RAG, eval, MLOps on your data and toolchain under your rules."
    ),
    line2: heroL(
      "s6-2",
      "Mentoring until teams own the workflows in-house."
    ),
    line3: heroL("s6-3", "Technical training."),
  },
  {
    line1: heroL(
      "s7-1",
      "Advisory: architecture, vendor DD, launch gates, controls, blast-radius."
    ),
    line2: heroL(
      "s7-2",
      "Eval specs, guardrails, ranked mitigation backlog."
    ),
    line3: heroL("s7-3", "Technical due diligence."),
  },
  {
    line1: heroL(
      "s8-1",
      "ML and AI end-to-end: versioned artifacts, owners from commit to production."
    ),
    line2: heroL(
      "s8-2",
      "Consulting and knowledge transfer so capability stays in-house."
    ),
    line3: heroL("s8-3", "ML · AI · MLOps · governance · teaching."),
  },
];

const HERO_INTERVAL_NORMAL_MS = 15000;
const HERO_INTERVAL_FIRST_MS = 19000;

/** Hero line crossfade + vertical nudge — shipped behavior (#41); do not replace with word stagger. */
const HERO_LINE_MOTION = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.5 },
} as const;

function HeroLineChunks({
  chunks,
  italic,
  reducedMotion,
  /** Keep one visual row on narrow viewports (hero line 1); horizontal scroll on parent. */
  nowrapMobile,
}: {
  chunks: readonly HeroChunk[];
  italic?: boolean;
  reducedMotion?: boolean;
  nowrapMobile?: boolean;
}) {
  const text = chunks.map((c) => c.text).join("");
  const wrapClass = nowrapMobile
    ? "whitespace-normal break-words max-md:whitespace-nowrap max-md:break-normal"
    : "whitespace-normal break-words";
  if (reducedMotion) {
    return (
      <span
        className={`${wrapClass}${italic ? " italic text-black/85" : ""}`}
      >
        {text}
      </span>
    );
  }
  return (
    <span
      className={`${wrapClass}${italic ? " italic text-black/85" : ""}`}
    >
      {chunks.map(({ slot, text: chunkText }, index) => {
        const prevText = chunks[index - 1]?.text ?? "";
        const gapBefore =
          index > 0 && prevText.length > 0 && chunkText.length > 0;
        return (
          <React.Fragment key={slot}>
            <span
              className={
                gapBefore
                  ? "inline-block max-w-full align-baseline ml-[0.35em]"
                  : "inline-block max-w-full align-baseline"
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                {chunkText ? (
                  <motion.span
                    key={chunkText}
                    {...HERO_LINE_MOTION}
                    className="inline-block max-w-full align-baseline"
                  >
                    {chunkText}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );
}

const SERVICES = [
  {
    icon: FiCpu,
    title: "LLM Consulting & Strategy",
    desc: "Roadmap through production: model choice, context, evaluation, and shipping systems that scale.",
    mobileDesc: "Strategy, context, evals, delivery.",
  },
  {
    icon: FiSearch,
    title: "RAG Audits",
    desc: "Retrieval, chunking, prompts, and telemetry — reviewed end-to-end and tightened where it matters.",
    mobileDesc: "RAG retrieval, chunking, prompts, telemetry.",
  },
  {
    icon: FiServer,
    title: "ML Engineering & MLOps",
    desc: "Training pipelines, registries, CI/CD, and running ML reliably from notebook to production.",
    mobileDesc: "Pipelines, registries, CI/CD, deployment.",
  },
  {
    icon: FiShield,
    title: "AI Governance & Compliance",
    desc: "Risk tiers, policies, documentation, and practical readiness for the EU AI Act and similar regimes.",
    mobileDesc: "AI Act readiness, policies, risk, docs.",
  },
  {
    icon: FiBarChart2,
    title: "Evaluation & Guardrails",
    desc: "Offline and online evaluation, red-teaming, filters, and runtime guardrails you can rely on.",
    mobileDesc: "Evals, red-teaming, filters, guardrails.",
  },
  {
    icon: FiBookOpen,
    title: "Teaching & Advisory",
    desc: "Workshops and mentoring on LLMs, RAG, MLOps, and responsible delivery — hands-on, not slide-only.",
    mobileDesc: "Workshops, mentoring, technical training.",
  },
] as const;

const STACK_GROUPS = [
  { label: "AI / ML", items: ["PyTorch", "TensorFlow", "Hugging Face", "OpenAI", "Anthropic", "LangChain", "LlamaIndex", "AI Agents", "Function Calling", "Pydantic", "Structured Output", "RAG", "Fine-tuning", "LoRA", "Prompt Engineering", "Embeddings", "Jupyter", "MLflow", "W&B", "Transformers", "CNNs", "RNNs", "GANs", "SVMs", "GBMs", "Deep Learning", "NLP", "Reinforcement Learning"] },
  { label: "Languages", items: ["Python", "Rust", "TypeScript", "SQL", "Bash"] },
  { label: "Data", items: ["PostgreSQL", "MongoDB", "Neo4j", "Redis", "Kafka", "Celery", "Pinecone", "Qdrant", "S3", "GCS"] },
  { label: "Infra", items: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Sentry", "GitHub Actions", "GitLab CI", "pytest", "Linux", "Git"] },
  { label: "Web", items: ["FastAPI", "Streamlit", "Next.js", "React", "Node.js", "Supabase", "Tailwind CSS", "Vercel"] },
] as const;

/** Shared uppercase rail labels (Services uses slightly stronger tone) */
const overlayLabelServices =
  "text-center text-xs font-semibold tracking-[0.2em] uppercase text-black/40";

const ENGAGEMENT_PRICING = [
  {
    title: "AI/ML System Audit",
    description: "System weaknesses, evaluation gaps, and ML/LLM risks.",
    prices: ["€1,800 – €3,500"],
  },
  {
    title: "AI/ML System Build",
    description: "Production grade ML and AI system design and implementation.",
    prices: ["€5,000 – €14,000+"],
  },
  {
    title: "Evaluation & Reliability",
    description: "Evaluation frameworks, behavior testing, and stability.",
    prices: ["€4,000 – €10,000"],
  },
  {
    title: "Governance & Traceability",
    description: "Auditable systems aligned with legal and governance constraints.",
    prices: ["€6,000 – €18,000+"],
  },
] as const;

/** Shown as one compact line under pricing cards (not a fifth column). */
const ENGAGEMENT_CUSTOM_FOOTER = {
  label: "Custom AI/ML systems",
  blurb: "End to end systems, internal platforms, and high stakes use cases.",
  priceProject: "€8,000 – €30,000+",
  priceRetainer: "€1,500 – €4,000 / month",
} as const;

function EngagementPricingSection({ variant }: { variant: "mobile" | "desktop" }) {
  const isMobile = variant === "mobile";
  return (
    <section
      className={
        isMobile
          ? "w-full max-w-2xl mx-auto shrink-0 mt-6 pt-4 pb-4 border-t border-b border-black/[0.06] px-2"
          : "w-full max-w-[min(100%,88rem)] mx-auto shrink-0 mt-6 md:mt-8 pt-4 md:pt-5 pb-4 md:pb-5 border-t border-b border-black/[0.06] px-3 sm:px-4"
      }
      aria-labelledby="engagement-pricing-heading"
    >
      <div className="text-center max-w-xl mx-auto">
        <h2
          id="engagement-pricing-heading"
          className="text-center text-[9px] md:text-[10px] font-semibold tracking-[0.18em] uppercase text-black/30"
        >
          Engagement &amp; Pricing
        </h2>
        <p
          className={
            isMobile
              ? "mt-1.5 text-[10px] leading-snug text-zinc-600 line-clamp-2"
              : "mt-2 text-[10px] md:text-[11px] leading-snug text-zinc-600 line-clamp-2"
          }
        >
          Each engagement is scoped individually based on system complexity, constraints, and risk
          level.
        </p>
      </div>

      <ul
        className={
          isMobile
            ? "mt-4 flex w-full max-w-[min(100%,19.5rem)] mx-auto flex-col items-center gap-y-6 text-center"
            : "mt-4 flex flex-col md:flex-row md:flex-nowrap md:justify-center md:items-stretch gap-y-2 gap-x-2 min-[900px]:gap-x-3 min-[1100px]:gap-x-4 w-full"
        }
      >
        {ENGAGEMENT_PRICING.map((row) => (
          <li
            key={row.title}
            className={
              isMobile
                ? "flex w-full flex-col items-center text-center"
                : "w-full md:flex-1 md:basis-0 md:min-w-0 md:max-w-[10.25rem] xl:max-w-[10.75rem] md:flex md:flex-col text-left"
            }
          >
            <h3
              className={
                isMobile
                  ? "text-[11px] font-semibold text-black leading-tight text-balance"
                  : "text-[10px] md:text-[11px] font-semibold text-black leading-tight"
              }
            >
              {row.title}
            </h3>
            <p
              className={
                isMobile
                  ? "mt-1 max-w-[17rem] text-[9px] leading-snug text-zinc-600 line-clamp-2 text-balance"
                  : "mt-0.5 text-[9px] md:text-[10px] leading-snug text-zinc-600 line-clamp-2 md:line-clamp-3"
              }
            >
              {row.description}
            </p>
            <div
              className={
                isMobile
                  ? "mt-3 w-full text-[11px] font-bold text-black tabular-nums leading-tight tracking-tight"
                  : "mt-1.5 md:mt-auto text-[10px] md:text-xs font-semibold text-black tabular-nums leading-tight"
              }
            >
              {row.prices.map((line) => (
                <p key={line} className={row.prices.length > 1 ? "mt-0.5 first:mt-0" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p
        className={
          isMobile
            ? "mt-4 text-center text-[9px] leading-snug text-zinc-600 text-balance max-w-[min(100%,22rem)] mx-auto px-1"
            : "mt-4 md:mt-5 text-center text-[9px] md:text-[10px] leading-snug text-zinc-600 text-balance max-w-[min(100%,40rem)] mx-auto px-2"
        }
      >
        <span className="font-semibold text-black">{ENGAGEMENT_CUSTOM_FOOTER.label}</span>
        {" — "}
        {ENGAGEMENT_CUSTOM_FOOTER.blurb}{" "}
        <span className="font-semibold text-black tabular-nums whitespace-nowrap">
          {ENGAGEMENT_CUSTOM_FOOTER.priceProject}
        </span>
        {" or "}
        <span className="font-semibold text-black tabular-nums whitespace-nowrap">
          {ENGAGEMENT_CUSTOM_FOOTER.priceRetainer}
        </span>
        .
      </p>
    </section>
  );
}

function ServicesOverlay({ show }: { show: boolean }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = show ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [show]);

  const ease: [number, number, number, number] = [0.25, 1, 0.5, 1];

  const gridVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.18, ease } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease } },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.section
          key="services-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease }}
          className="fixed inset-0 z-[9999] w-screen bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc] overflow-hidden"
          style={{ height: "100svh", minHeight: "100dvh" }}
          role="dialog"
          aria-modal="true"
          aria-label="Services"
        >
          {/* MOBILE ≤480px — fits exactly on phone screen, no scroll */}
          <div
            className="hidden max-[480px]:flex flex-col w-full h-full min-h-0 overflow-y-auto overflow-x-hidden"
            style={{
              padding: "12px 14px calc(env(safe-area-inset-bottom) + 10px)",
            }}
          >
            <div className={`w-full pb-4 ${overlayLabelServices}`}>Services</div>
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2.5 w-full shrink-0"
            >
              {SERVICES.map(({ icon: Icon, title, mobileDesc }) => (
                <motion.div
                  key={`m-${title}`}
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center text-center rounded-xl bg-white shrink-0 border border-black/[0.06] shadow-[0_3px_14px_rgba(0,0,0,0.05)]"
                  style={{ padding: "9px 11px" }}
                >
                  <Icon size={15} color="#004CFF" className="mb-1" />
                  <h3 className="font-semibold text-black text-xs leading-snug">{title}</h3>
                  <p className="text-[11px] leading-relaxed text-zinc-600 mt-1.5 line-clamp-3">{mobileDesc}</p>
                </motion.div>
              ))}
            </motion.div>
            <EngagementPricingSection variant="mobile" />
            <div className="w-full mt-6 pt-4 shrink-0">
              <div className="text-center text-[7.5px] font-semibold tracking-[0.18em] uppercase text-black/25 mb-2">
                Stack
              </div>
              <div className="flex flex-col gap-1.5 px-1 items-center">
                {STACK_GROUPS.map(({ label, items }) => (
                  <div key={label} className="text-center">
                    <span className="text-[6.5px] font-semibold tracking-[0.12em] uppercase text-black/25 mr-0.5">
                      {label}:
                    </span>
                    <span className="text-[7px] text-black/35 leading-tight">{items.join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLET/DESKTOP — cohesive services → pricing → stack; scroll if viewport is short */}
          <div className="max-[480px]:hidden w-full h-full min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-3 md:py-5 overflow-hidden overflow-x-hidden">
            <div className={`w-full max-w-6xl mx-auto shrink-0 pb-3 md:pb-4 ${overlayLabelServices}`}>
              Services
            </div>
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid max-[815px]:grid-cols-2 min-[816px]:grid-cols-3 justify-center items-start w-fit max-w-6xl mx-auto shrink-0"
              style={{ rowGap: "16px", columnGap: "16px" }}
            >
              {SERVICES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  className="group flex flex-col items-center justify-center text-center rounded-xl border border-[rgba(0,42,255,0.12)] bg-white shadow-[0_6px_22px_rgba(0,0,0,0.07),inset_0_0_0_1px_rgba(8,28,244,0.06)] transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_9px_28px_rgba(0,0,0,0.09)] w-[128px] min-[640px]:w-[140px] min-[816px]:w-[148px] aspect-square min-h-0"
                  style={{ padding: "7px 6px" }}
                >
                  <div className="flex flex-col items-center justify-center gap-1 w-full max-w-[96%] mx-auto min-h-0 flex-1">
                    <div className="h-5 w-full flex items-end justify-center shrink-0">
                      <Icon
                        size={16}
                        color="#004CFF"
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-semibold text-black text-[10px] sm:text-[11px] leading-tight line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] leading-snug text-zinc-600 line-clamp-4">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <EngagementPricingSection variant="desktop" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-6 md:mt-8 pt-4 md:pt-5 w-full max-w-4xl mx-auto shrink-0"
            >
              <div className="text-center text-[10px] font-semibold tracking-[0.18em] uppercase text-black/25 mb-2 md:mb-2.5">
                Stack
              </div>
              <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-10 gap-y-3 max-w-4xl mx-auto px-1">
                {STACK_GROUPS.map(({ label, items }) => (
                  <div key={label} className="flex flex-col items-center max-w-[150px] sm:max-w-none">
                    <span className="text-[7.5px] font-semibold tracking-[0.14em] uppercase text-black/20 mb-1">
                      {label}
                    </span>
                    <span className="text-[8.5px] text-black/40 text-center leading-snug">
                      {items.join("  ·  ")}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  const [heroStateIndex, setHeroStateIndex] = useState(0);
  const [heroReducedMotion, setHeroReducedMotion] = useState(false);
  const [heroPointerPaused, setHeroPointerPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const cooldownRef = useRef(false);
  const heroPausedRef = useRef(false);
  const heroAdvanceTimerRef = useRef<number | null>(null);
  const heroFirstAdvanceScheduledRef = useRef(false);
  const router = useRouter();

  const heroSceneCount = HERO_SCENES.length;
  const heroState = HERO_SCENES[heroStateIndex % heroSceneCount]!;

  useEffect(() => {
    heroPausedRef.current = heroPointerPaused;
  }, [heroPointerPaused]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setHeroReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (heroReducedMotion) {
      setHeroStateIndex(0);
    }
  }, [heroReducedMotion]);

  useEffect(() => {
    if (heroReducedMotion) return;

    const clearT = () => {
      if (heroAdvanceTimerRef.current != null) {
        window.clearTimeout(heroAdvanceTimerRef.current);
        heroAdvanceTimerRef.current = null;
      }
    };

    let cancelled = false;
    const schedule = (delay: number) => {
      clearT();
      heroAdvanceTimerRef.current = window.setTimeout(() => {
        heroAdvanceTimerRef.current = null;
        if (cancelled) return;
        heroFirstAdvanceScheduledRef.current = true;
        if (!heroPausedRef.current) {
          setHeroStateIndex((p) => (p + 1) % heroSceneCount);
        }
        schedule(HERO_INTERVAL_NORMAL_MS);
      }, delay);
    };

    schedule(
      heroFirstAdvanceScheduledRef.current
        ? HERO_INTERVAL_NORMAL_MS
        : HERO_INTERVAL_FIRST_MS
    );

    return () => {
      cancelled = true;
      clearT();
    };
  }, [heroReducedMotion, heroSceneCount]);

  // --- Overlay control (vertical scroll/keys/touch) ---
  useEffect(() => {
    const COOLDOWN = 350;
    let touchStartY: number | null = null;

    const setCooldown = () => {
      cooldownRef.current = true;
      window.setTimeout(() => (cooldownRef.current = false), COOLDOWN);
    };
    const open = () => {
      if (!showGrid && !cooldownRef.current) {
        setShowGrid(true);
        setCooldown();
      }
    };
    const close = () => {
      if (showGrid && !cooldownRef.current) {
        setShowGrid(false);
        setCooldown();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) open();
      else close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (["PageDown", "ArrowDown", " "].includes(e.key)) open();
      else if (["PageUp", "ArrowUp", "Escape"].includes(e.key)) close();
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY == null) return;
      const dy = touchStartY - e.touches[0].clientY;
      if (dy > 10) open();
      else if (dy < -10) close();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [showGrid]);

  const ease = [0.22, 1, 0.36, 1] as const;

  // --- SWIPE RIGHT→LEFT for /blog (touchpad & touch) ---
  const triggeredRef = useRef(false);
  const goBlog = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    router.push("/blog");
    setTimeout(() => {
      triggeredRef.current = false;
    }, 1200);
  }, [router]);

  const X_THRESHOLD = 80;
  const V_THRESHOLD = 0.3;
  const WHEEL_THRESHOLD = -100;

  const onPanEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    const horizontal = Math.abs(offset.x) > Math.abs(offset.y);
    if (horizontal && offset.x <= -X_THRESHOLD && Math.abs(velocity.x) >= V_THRESHOLD) {
      goBlog();
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.deltaX <= WHEEL_THRESHOLD) {
      goBlog();
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen text-text-light dark:text-text-dark transition-colors duration-500"
      style={{ background: "linear-gradient(135deg, #e9d7cb, #d6c2b7)" }}
    >
      {!showGrid && (
        <>
          <motion.main
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease }}
            className="flex-grow flex flex-col items-center justify-center px-4 text-center"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onPanEnd={onPanEnd}
              onWheel={onWheel}
              className="w-full"
              aria-label="Swipe left on the hero to open blog posts"
            >
              <div className="flex flex-col items-center z-10">
                <div className="relative w-44 h-44 sm:w-40 sm:h-40 mt-6 sm:mt-12 mb-1">
                  {/* Hair strand — thin wisp (754×104), translate-based positioning */}
                  <Image
                    src="/hair-strand.png"
                    alt=""
                    width={754}
                    height={104}
                    draggable={false}
                    className="absolute right-0 bottom-0 pointer-events-none select-none z-[5] h-auto hidden sm:block sm:w-[100px] md:w-[125px] rotate-[-3deg] sm:translate-x-[-3%] sm:translate-y-[45%]"
                  />

                  {/* Portrait */}
                  <div
                    className="w-full h-full relative z-[4]"
                    style={{ clipPath: "circle(50% at 50% 50%)" }}
                  >
                    <Image
                      src="/portrait.jpg"
                      alt="Portrait"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: "center 0%", transform: "scale(1.21)" }}
                    />
                  </div>
                </div>

                <motion.h1
                  whileHover={{ scale: 1.02 }}
                  style={{ fontSize: "1.10rem", lineHeight: "1.1" }}
                  className="font-bold hover:scale-110 transition-transform duration-300 tracking-tight relative z-10 mt-3"
                >
                  Ing. et Ing. Mgr. Monika Dvorackova
                </motion.h1>

                <div
                  className="max-md:text-[11px] text-sm md:text-base font-medium w-full max-w-2xl px-1 sm:px-2 mt-2 mb-1.5 cursor-default flex flex-col gap-0 leading-snug md:leading-snug"
                  aria-live="polite"
                  title="Hover or touch here to pause rotation"
                  onPointerEnter={() => setHeroPointerPaused(true)}
                  onPointerLeave={() => setHeroPointerPaused(false)}
                >
                  <p className="m-0 p-0 text-center text-pretty max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
                    <HeroLineChunks
                      chunks={heroState.line1}
                      reducedMotion={heroReducedMotion}
                      nowrapMobile
                    />
                  </p>
                  <p className="m-0 p-0 text-center text-pretty">
                    <HeroLineChunks
                      chunks={heroState.line2}
                      reducedMotion={heroReducedMotion}
                    />
                  </p>
                  <p className="m-0 p-0 text-center text-pretty text-black/85">
                    <HeroLineChunks
                      chunks={heroState.line3}
                      italic
                      reducedMotion={heroReducedMotion}
                    />
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1 pt-[0.3rem]">
                  <a
                    href="https://www.linkedin.com/in/monika-dvorackova/?locale=en_US"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <FaLinkedin size={18} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href="https://github.com/monikadvorackova"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                  >
                    <FaGithub size={18} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href="https://arxiv.org/search/?searchtype=author&query=Dvorackova%2C+M"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="arXiv"
                  >
                    <ArxivIcon size={18} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a href="mailto:monika.dvorack@gmail.com" title="Send Email">
                    <FaEnvelope size={18} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                </div>

                <div className="mt-3 flex flex-col items-center">
                  <div className="text-xs md:text-sm font-normal lowercase mb-1.5 hover:scale-110 transition-transform duration-300 translate-y-[6px]">
                    Consultation / Articles & Software
                  </div>
                  <div className="pt-[0.3rem] flex gap-1">
                    <a
                      href="https://calendly.com/monika-dvorack/15min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group transition-all duration-300"
                      title="Book via Calendly"
                    >
                      <FaCalendarAlt
                        size={16}
                        className="text-black transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1 translate-y-[8px]"
                      />
                    </a>
                    <Link
                      href="/blog"
                      className="group transition-all duration-300"
                      title="View Articles & Software"
                    >
                      <FaFileAlt
                        size={16}
                        className="text-black transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1 translate-y-[8px]"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.main>

          <section
            aria-labelledby="govai-highlight-heading"
            className="w-full max-w-xl mx-auto px-4 shrink-0 pt-2 pb-0 mb-8 border-t border-black/[0.06]"
          >
            <h2
              id="govai-highlight-heading"
              className="text-center text-[8px] font-semibold tracking-[0.16em] uppercase text-black/30"
            >
              GovAI
            </h2>
            <p className="mt-1 text-[11px] font-medium text-black text-center leading-tight text-balance px-0.5">
              Audit-ready infrastructure for ML and LLM systems.
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-600 text-center leading-tight text-balance max-w-md mx-auto px-0.5">
              A system for evidence, policy enforcement, and compliance-ready AI workflows.
            </p>
            <div className="mt-1 flex justify-center">
              <Link
                href="/blog/govai"
                className="text-[10px] font-semibold text-[#004cff] hover:opacity-90 transition-opacity"
              >
                View GovAI
              </Link>
            </div>
          </section>

          <div className="flex flex-col items-center mt-auto pt-6">
            <p className="mb-2 max-w-[16rem] px-2 text-center text-[8px] font-semibold tracking-[0.16em] uppercase text-black/30 text-balance">
              Services · pricing · stack
            </p>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-black/30 mb-3"
              aria-hidden
            >
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l7 7 7-7" />
              </svg>
            </motion.div>
            <footer className="text-[10px] text-neutral-500 text-center py-3">
              © 2026 Monika Dvorackova
            </footer>
          </div>
        </>
      )}

      <ServicesOverlay show={showGrid} />
    </div>
  );
}
