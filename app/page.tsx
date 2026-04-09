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

const aiWords = ["AI", "LLM Engineering", "AI Strategy", "AI Infrastructure"];
const mlWords = ["Machine Learning", "Deep Learning", "Model Deployment"];
const lawWords = ["ML & AI teaching", "Legal AI", "Tech Ethics", "Compliance"];


function CrossfadeWord({ word }: { word: string }) {
  return (
    <motion.span
      key={word}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.5 }}
      className="inline-block"
    >
      {word}
    </motion.span>
  );
}

const SERVICES = [
  { icon: FiCpu, title: "LLM Consulting & Strategy", desc: "From AI roadmap to production: model selection, context design, evaluation, and deployment that scales.", mobileDesc: "LLM strategy, context design, evals, and delivery." },
  { icon: FiSearch, title: "RAG Audits", desc: "Is your RAG actually working? Retrieval quality, chunking, prompts, memory and telemetry — audited and fixed.", mobileDesc: "RAG retrieval, chunking, prompts, and telemetry." },
  { icon: FiServer, title: "ML Engineering & MLOps", desc: "From classical ML to deep learning: model development, training pipelines, registries, CI/CD, and production deployment.", mobileDesc: "Training pipelines, registries, CI/CD, and deployment." },
  { icon: FiShield, title: "AI Governance & Compliance", desc: "Risk classification, policies, DPIA, model documentation, and readiness for the EU AI Act and beyond.", mobileDesc: "AI Act readiness, policies, risk, and documentation." },
  { icon: FiBarChart2, title: "Evaluation & Guardrails", desc: "Offline & online evals, red-teaming, safety filters, and runtime guardrails to keep AI in check.", mobileDesc: "Evals, red teaming, safety filters, and runtime guardrails." },
  { icon: FiBookOpen, title: "Teaching & Advisory", desc: "Workshops, mentoring, and hands-on training in LLMs, RAG, MLOps, and responsible AI.", mobileDesc: "Workshops, mentoring, and technical AI training." },
] as const;

const STACK_GROUPS = [
  { label: "AI / ML", items: ["PyTorch", "TensorFlow", "Hugging Face", "OpenAI", "Anthropic", "LangChain", "LlamaIndex", "AI Agents", "Function Calling", "Pydantic", "Structured Output", "RAG", "Fine-tuning", "LoRA", "Prompt Engineering", "Embeddings", "Jupyter", "MLflow", "W&B", "Transformers", "CNNs", "RNNs", "GANs", "SVMs", "GBMs", "Deep Learning", "NLP", "Reinforcement Learning"] },
  { label: "Languages", items: ["Python", "Rust", "TypeScript", "SQL", "Bash"] },
  { label: "Data", items: ["PostgreSQL", "MongoDB", "Neo4j", "Redis", "Kafka", "Celery", "Pinecone", "Qdrant", "S3", "GCS"] },
  { label: "Infra", items: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Sentry", "GitHub Actions", "GitLab CI", "pytest", "Linux", "Git"] },
  { label: "Web", items: ["FastAPI", "Streamlit", "Next.js", "React", "Node.js", "Supabase", "Tailwind CSS", "Vercel"] },
] as const;

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
          {/* MOBILE ≤480px — compact 1-column horizontal cards */}
          <div
            className="hidden max-[480px]:flex flex-col w-full h-full overflow-y-auto"
            style={{
              padding: "16px 16px calc(env(safe-area-inset-bottom) + 12px)",
            }}
          >
            <div className="w-full pb-2 text-center text-[9px] font-semibold tracking-[0.18em] uppercase text-black/30">
              Services
            </div>
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-[5px] w-full"
            >
              {SERVICES.map(({ icon: Icon, title, mobileDesc }) => (
                <motion.div
                  key={`m-${title}`}
                  variants={itemVariants}
                  className="flex items-start gap-3 rounded-lg bg-white"
                  style={{
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                    padding: "10px 12px",
                  }}
                >
                  <Icon size={14} color="#004CFF" className="mt-[2px] shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-black text-[11px] leading-tight">{title}</h3>
                    <p className="text-[9.5px] leading-snug text-neutral-500 mt-0.5">{mobileDesc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="w-full pt-3 pb-1">
              <div className="text-center text-[8px] font-semibold tracking-[0.18em] uppercase text-black/20 mb-2">Stack</div>
              <div className="flex flex-col gap-1 px-1 items-center">
                {STACK_GROUPS.map(({ label, items }) => (
                  <div key={label} className="text-center">
                    <span className="text-[7px] font-semibold tracking-[0.12em] uppercase text-black/20 mr-0.5">{label}:</span>
                    <span className="text-[7.5px] text-black/30 leading-tight">{items.join(" · ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLET/DESKTOP */}
          <div className="max-[480px]:hidden w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 overflow-y-auto">
            <div className="pb-6 text-center text-[10px] font-semibold tracking-[0.18em] uppercase text-black/35">
              Services
            </div>
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid max-[815px]:grid-cols-2 min-[816px]:grid-cols-3 justify-center items-start w-fit mx-auto"
              style={{ rowGap: "64px", columnGap: "48px" }}
            >
              {SERVICES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  className="group flex flex-col items-center justify-center text-center rounded-[20px] border transition-transform transition-shadow duration-300 ease-out hover:scale-105 hover:shadow-lg bg-white shadow-[0_10px_26px_rgba(0,0,0,0.06)] w-full sm:w-[200px] min-[816px]:w-[240px] sm:aspect-square"
                  style={{
                    border: "1px solid rgba(0, 42, 255, 0.1)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(8, 28, 244, 0.05), 0 10px 26px rgba(0,0,0,0.06)",
                    backgroundColor: "#ffffff",
                    padding: "clamp(10px, 2.6vw, 14px)",
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full max-w-[90%] mx-auto">
                    <div className="h-[30px] w-full flex items-end justify-center">
                      <Icon
                        size={18}
                        color="#004CFF"
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-semibold text-black text-[11px] leading-tight">
                      {title}
                    </h3>
                    <p className="text-[9.5px] text-[#004CFF] leading-snug text-neutral-700">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-10"
            >
              <div className="text-center text-[10px] font-semibold tracking-[0.18em] uppercase text-black/25 mb-5">Stack</div>
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 max-w-[760px] mx-auto">
                {STACK_GROUPS.map(({ label, items }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-[8px] font-semibold tracking-[0.16em] uppercase text-black/20 mb-1.5">{label}</span>
                    <span className="text-[10px] text-black/40 text-center leading-relaxed">{items.join("  ·  ")}</span>
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
  const [aiIndex, setAiIndex] = useState(0);
  const [mlIndex, setMlIndex] = useState(0);
  const [lawIndex, setLawIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const cooldownRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      setAiIndex((i) => (i + 1) % aiWords.length);
      setMlIndex((i) => (i + 1) % mlWords.length);
      setLawIndex((i) => (i + 1) % lawWords.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

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
              <div className="flex flex-col items-center space-y-6 z-10">
                <div className="relative w-44 h-44 sm:w-40 sm:h-40 mt-6 sm:mt-12 mb-1">
                  {/* Hair strand — thin wisp (754×104), translate-based positioning */}
                  <Image
                    src="/hair-strand.png"
                    alt=""
                    width={754}
                    height={104}
                    draggable={false}
                    className="absolute right-0 bottom-0 pointer-events-none select-none z-[5] h-auto w-[110px] sm:w-[100px] md:w-[125px] rotate-[-3deg] translate-x-[12%] translate-y-[35%] sm:translate-x-[-3%] sm:translate-y-[45%]"
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
                  className="font-medium hover:scale-110 transition-transform duration-300 tracking-tight relative z-10 mt-3"
                >
                  Ing. et Ing. Mgr. Monika Dvorackova
                </motion.h1>

                <div className="text-sm md:text-base font-medium max-w-xl leading-snug px-2">
                  <p className="mb-0">
                    I’m an engineer & consultant in{" "}
                    <span className="inline-block align-baseline">
                      <AnimatePresence mode="wait">
                        <CrossfadeWord word={aiWords[aiIndex]} />
                      </AnimatePresence>
                    </span>
                    , helping companies implement{" "}
                    <span className="inline-block align-baseline">
                      <AnimatePresence mode="wait">
                        <CrossfadeWord word={mlWords[mlIndex]} />
                      </AnimatePresence>
                    </span>{" "}
                    solutions.
                  </p>
                  <p className="italic mt-0">
                    And occasionally, a bit of{" "}
                    <span className="inline-block align-baseline">
                      <AnimatePresence mode="wait">
                        <CrossfadeWord word={lawWords[lawIndex]} />
                      </AnimatePresence>
                    </span>
                    .
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1 mt-4">
                  <a
                    href="https://www.linkedin.com/in/monika-dvorackova/?locale=en_US"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                  >
                    <FaLinkedin size={20} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href="https://github.com/monikadvorackova"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="GitHub"
                  >
                    <FaGithub size={20} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href="https://arxiv.org/search/?searchtype=author&query=Dvorackova%2C+M"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="arXiv"
                  >
                    <ArxivIcon size={20} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a href="mailto:monika.dvorack@gmail.com" title="Send Email">
                    <FaEnvelope size={20} className="text-black hover:scale-110 transition-transform duration-300" />
                  </a>
                </div>

                <div className="mt-2 flex flex-col items-center">
                  <div className="text-sm md:text-base font-normal mb-2 hover:scale-110 transition-transform duration-300 translate-y-[6px]">
                    Consultation / Articles & SaaS
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
                        size={18}
                        className="text-black transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1 translate-y-[8px]"
                      />
                    </a>
                    <Link
                      href="/blog"
                      className="group transition-all duration-300"
                      title="View Articles & SaaS"
                    >
                      <FaFileAlt
                        size={18}
                        className="text-black transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1 translate-y-[8px]"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.main>

          <div className="flex flex-col items-center mt-auto">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-black/20 mb-4"
            >
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l7 7 7-7" />
              </svg>
            </motion.div>
            <footer className="text-[10px] text-neutral-500 text-center py-3">
              © 2026 Monika Dvořáčková
            </footer>
          </div>
        </>
      )}

      <ServicesOverlay show={showGrid} />
    </div>
  );
}
