// app/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaLinkedin,
  FaGithub,
  FaCalendarAlt,
  FaEnvelope,
  FaFileAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCpu,
  FiSearch,
  FiServer,
  FiShield,
  FiBarChart2,
  FiBookOpen,
} from "react-icons/fi";
import ArxivIcon from "../components/ArxivIcon";
import { createPortal } from "react-dom";

/* --- Rotující slova v hero --- */
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

/* --- Data pro 3×2 grid --- */
const SERVICES = [
  { icon: FiCpu,       title: "LLM Consulting",          desc: "From strategy to delivery: selection, context design, evaluation and productionization." },
  { icon: FiSearch,    title: "RAG Audits",              desc: "RAG quality audits and fixes: retrieval quality, chunking, prompts, memory and telemetry." },
  { icon: FiServer,    title: "MLOps",                   desc: "Pipelines, model registries, CI/CD, data & feature stores, and secure deployments." },
  { icon: FiShield,    title: "AI Compliance (EU)",      desc: "Risk classification, policies, DPIA, model documentation, and readiness for the EU AI Act." },
  { icon: FiBarChart2, title: "Evaluation & Guardrails", desc: "Offline & online evals, red-teaming, safety filters, and runtime guardrails." },
  { icon: FiBookOpen,  title: "Teaching & Advisory",     desc: "Workshops and mentoring on LLMs, RAG, MLOps, and responsible AI." },
] as const;

/* --- Footer ukotvený přes portal (pro overlay režim) --- */
function FixedFooterPortal() {
  if (typeof window === "undefined") return null;
  return createPortal(
    <footer className="text-[10px] text-neutral-500 text-center py-4 fixed bottom-0 left-0 w-full bg-transparent z-[10000] pointer-events-none">
      <span className="pointer-events-auto">© 2025 Monika Dvorackova</span>
    </footer>,
    document.body
  );
}

/* --- Overlay s kartami --- */
function ServicesOverlay({ show }: { show: boolean }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = show ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [show]);

  const ease = [0.25, 1, 0.5, 1] as const;
  const gridVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.18, ease } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease } },
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
          className="fixed inset-0 z-[9999] flex items-center justify-center h-screen w-screen bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc]"
          role="dialog"
          aria-modal="true"
          aria-label="Services"
        >
          <div className="w-full h-full flex items-center justify-center px-14">
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 180px)",
                gridTemplateRows: "repeat(2, 180px)",
                gap: "44px",
                justifyItems: "center",
                alignItems: "center",
              }}
            >
              {SERVICES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  className="group flex flex-col items-center justify-center text-center rounded-[20px] border border-neutral-200 bg-white transition-transform transition-shadow duration-300 ease-out hover:scale-105 hover:shadow-lg hover:border-neutral-300"
                  style={{
                    width: 180,
                    height: 180,
                    padding: 14,
                    boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full max-w-[150px] mx-auto">
                    <div className="h-[30px] w-full flex items-end justify-center">
                      <Icon size={18} color="#2563EB" className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="font-semibold text-black text-[11px] leading-tight">
                      {title}
                    </h3>
                    <p className="text-[9.5px] leading-snug text-neutral-700">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/* --- Stránka --- */
export default function HomePage() {
  const [aiIndex, setAiIndex] = useState(0);
  const [mlIndex, setMlIndex] = useState(0);
  const [lawIndex, setLawIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const cooldownRef = useRef(false);

  // Rotace slov
  useEffect(() => {
    const id = window.setInterval(() => {
      setAiIndex((i) => (i + 1) % aiWords.length);
      setMlIndex((i) => (i + 1) % mlWords.length);
      setLawIndex((i) => (i + 1) % lawWords.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  // Ovládání gridu
  useEffect(() => {
    const COOLDOWN = 350;
    let touchStartY: number | null = null;
    const lock = () => { cooldownRef.current = true; window.setTimeout(() => (cooldownRef.current = false), COOLDOWN); };
    const open  = () => { if (!showGrid && !cooldownRef.current) { setShowGrid(true);  lock(); } };
    const close = () => { if ( showGrid && !cooldownRef.current) { setShowGrid(false); lock(); } };

    const onWheel = (e: WheelEvent) => { e.deltaY > 0 ? open() : close(); };
    const onKey   = (e: KeyboardEvent) => {
      if (["PageDown","ArrowDown"," "].includes(e.key)) open();
      if (["PageUp","ArrowUp","Escape"].includes(e.key)) close();
    };
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove  = (e: TouchEvent) => {
      if (touchStartY == null) return;
      const dy = touchStartY - e.touches[0].clientY;
      dy > 10 ? open() : dy < -10 && close();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("keydown", onKey as any);
      window.removeEventListener("touchstart", onTouchStart as any);
      window.removeEventListener("touchmove", onTouchMove as any);
    };
  }, [showGrid]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div
      className="flex flex-col min-h-screen text-text-light dark:text-text-dark transition-colors duration-500"
      style={{ background: "linear-gradient(135deg, #e9d7cb, #d6c2b7)" }}
    >
      {/* HERO */}
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
            <div className="flex flex-col items-center space-y-6 z-10">
              <div className="relative w-48 h-48 mt-12 -mb-4">
                <div
                  className="w-full h-full relative"
                  style={{ clipPath: "circle(50% at 50% 50%)", overflow: "visible" }}
                >
                  <Image
                    src="/portrait.jpg"
                    alt="Portrait"
                    width={150}
                    height={150}
                    className="rounded-full object-cover scale-[1.18]"
                    style={{ objectPosition: "top center" }}
                  />
                </div>
              </div>

              <motion.h1
                whileHover={{ scale: 1.02 }}
                style={{ fontSize: "1.10rem", lineHeight: "1.1" }}
                className="font-medium hover:scale-110 transition-transform duration-300 tracking-tight"
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

              <div className="flex items-center justify-center gap-4 mt-6">
                <a href="https://www.linkedin.com/in/monika-dvorackova/?locale=en_US" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <FaLinkedin size={20} className="text-blue-600 hover:scale-110 transition-transform duration-300 align-middle" />
                </a>
                <a href="https://github.com/monikadvorackova" target="_blank" rel="noopener noreferrer" title="GitHub">
                  <FaGithub size={20} className="text-blue-600 hover:scale-110 transition-transform duration-300 align-middle" />
                </a>
                <a href="https://arxiv.org/search/?searchtype=author&query=Dvorackova%2C+M" target="_blank" rel="noopener noreferrer" title="arXiv">
                  <ArxivIcon size={20} className="text-blue-600 hover:scale-110 transition-transform duration-300 align-middle" />
                </a>
                <a href="mailto:monika.dvorack@gmail.com" title="Send Email">
                  <FaEnvelope size={20} className="text-blue-600 hover:scale-110 transition-transform duration-300 align-middle" />
                </a>
              </div>

              <div className="mt-8 flex flex-col items-center">
                <div className="text-base md:text-lg font-normal mb-2 hover:scale-110 transition-transform duration-300 translate-y-[6px]">
                  Consultation / Articles & SaaS
                </div>
                <div className="pt-[0.3rem] flex gap-4">
                  <a
                    href="https://calendly.com/monika-dvorack/15min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group transition-all duration-300"
                    title="Book via Calendly"
                  >
                    <FaCalendarAlt size={18} className="text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1 translate-y-[8px]" />
                  </a>
                  <Link href="/blog" className="group transition-all duration-300" title="View Articles & SaaS">
                    <FaFileAlt size={18} className="text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1 translate-y-[8px]" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.main>

          {/* Footer pro hero */}
          <footer className="text-[10px] text-neutral-500 text-center py-4 mt-auto">
            © 2025 Monika Dvorackova
          </footer>
        </>
      )}

      {/* GRID overlay */}
      <ServicesOverlay show={showGrid} />

      {/* Footer pro overlay (portal → mimo animovaný overlay) */}
      {showGrid && <FixedFooterPortal />}
    </div>
  );
}
