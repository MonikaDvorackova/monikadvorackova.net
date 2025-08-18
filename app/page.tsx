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
  { icon: FiCpu, title: "LLM Consulting", desc: "From strategy to delivery: selection, context design, evaluation and productionization." },
  { icon: FiSearch, title: "RAG Audits", desc: "RAG quality audits and fixes: retrieval quality, chunking, prompts, memory and telemetry." },
  { icon: FiServer, title: "MLOps", desc: "Pipelines, model registries, CI/CD, data & feature stores, and secure deployments." },
  { icon: FiShield, title: "AI Compliance (EU)", desc: "Risk classification, policies, DPIA, model documentation, and readiness for the EU AI Act." },
  { icon: FiBarChart2, title: "Evaluation & Guardrails", desc: "Offline & online evals, red-teaming, safety filters, and runtime guardrails." },
  { icon: FiBookOpen, title: "Teaching & Advisory", desc: "Workshops and mentoring on LLMs, RAG, MLOps, and responsible AI." },
] as const;

function FixedFooterPortal() {
  if (typeof window === "undefined") return null;
  return createPortal(
    <footer className="text-[10px] text-neutral-500 text-center py-4 fixed bottom-0 left-0 w-full bg-transparent z-[10000] pointer-events-none">
      <span className="pointer-events-auto">© 2025 Monika Dvorackova</span>
    </footer>,
    document.body
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
  className="fixed inset-0 z-[9999] flex items-center justify-center w-screen
             bg-gradient-to-br from-[#fdf2e9] to-[#f8e9dc]
             overflow-y-auto                /* mobil smí scrollovat */
             md:h-screen md:py-12"          /* desktop beze změny */
  style={{
    minHeight: '100dvh',                     // přesná výška viewportu na mobilech
    height: '100svh',
    paddingTop: '10px',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)', // aby poslední karta nebyla pod spodní lištou
  }}
  role="dialog"
  aria-modal="true"
  aria-label="Services"
>


          <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 md:px-10">
            <motion.div
              id="services-grid"
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid max-[480px]:grid-cols-1 max-[815px]:grid-cols-2 min-[816px]:grid-cols-3
                         justify-center items-start w-fit max-[480px]:w-full mx-auto max-[815px]:place-items-center"
              style={{ rowGap: "64px", columnGap: "48px" }}  
            >
              {SERVICES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  className="service-card group flex flex-col items-center justify-center text-center
                             rounded-[20px] border transition-transform transition-shadow duration-300 ease-out
                             hover:scale-105 hover:shadow-lg
                             bg-white shadow-[0_10px_26px_rgba(0,0,0,0.06)]
                             w-full sm:w-[200px] min-[816px]:w-[240px] sm:aspect-square"
                  style={{
                    border: "1px solid rgba(0, 42, 255, 0.1)",
                    boxShadow:
                      "inset 0 0 0 1px rgba(8, 28, 244, 0.05), 0 10px 26px rgba(0,0,0,0.06)",
                    backgroundColor: "#ffffff",
                    padding: "clamp(10px, 2.6vw, 14px)",
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full max-w-[90%] mx-auto">
                    <div className="service-icon h-[30px] w-full flex items-end justify-center">
                      <Icon size={18} color="#004CFF" className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="service-title font-semibold text-black text-[11px] leading-tight">{title}</h3>
                    <p className="service-desc text-[9.5px] text-[#004CFF] leading-snug">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* MOBILE-ONLY OVERRIDES  */}
          <style jsx global>{`
  @media (max-width: 480px) {
    #services-overlay {
      min-height: 100dvh;
      padding-top: max(140px, calc(12vh + env(safe-area-inset-top))) !important;
      padding-bottom: max(220px, calc(20vh + env(safe-area-inset-bottom))) !important;
      scroll-padding-top: max(140px, calc(12vh + env(safe-area-inset-top))) !important;
      scroll-padding-bottom: max(220px, calc(20vh + env(safe-area-inset-bottom))) !important;
    }

    #services-grid {
      width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
      box-sizing: border-box !important;
      row-gap: 28px !important;
      column-gap: 12px !important;
      justify-items: center !important;
      align-items: start !important;
    }

    .service-card {
      width: 100% !important;
      max-width: 560px;
      aspect-ratio: unset !important;
    }

    .service-icon { height: 22px !important; }
    .service-icon svg { width: 18px !important; height: 18px !important; }
    .service-title { font-size: 10px !important; }
    .service-desc { font-size: 9px !important; line-height: 1.25 !important; }


    #services-grid > .service-card:first-child { margin-top: 8px !important; }
    #services-grid > .service-card:last-child  { margin-bottom: 24vh !important; }
  }
`}</style>


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

  useEffect(() => {
    const id = window.setInterval(() => {
      setAiIndex((i) => (i + 1) % aiWords.length);
      setMlIndex((i) => (i + 1) % mlWords.length);
      setLawIndex((i) => (i + 1) % lawWords.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

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

          <footer className="text-[10px] text-neutral-500 text-center py-4 mt-auto">
            © 2025 Monika Dvorackova
          </footer>
        </>
      )}

      <ServicesOverlay show={showGrid} />
      {showGrid && <FixedFooterPortal />}
    </div>
  );
}
