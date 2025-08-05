"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaLinkedin, FaGithub, FaCalendarAlt, FaEnvelope, FaFileAlt } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ArxivIcon from "../components/ArxivIcon";

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
      transition={{ duration: 0.4 }}
      className="inline-block"
    >
      {word}
    </motion.span>
  );
}

export default function HomePage() {
  const [aiIndex, setAiIndex] = useState(0);
  const [mlIndex, setMlIndex] = useState(0);
  const [lawIndex, setLawIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiIndex((i) => (i + 1) % aiWords.length);
      setMlIndex((i) => (i + 1) % mlWords.length);
      setLawIndex((i) => (i + 1) % lawWords.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
  className="flex flex-col min-h-screen text-text-light dark:text-text-dark transition-colors duration-500"
  style={{
    background: "linear-gradient(135deg, #e9d7cb, #d6c2b7)",
  }}
>

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center space-y-6 z-10"
        >
          <div className="relative w-48 h-48 mt-12 -mb-4">
            <div
              className="w-full h-full relative"
              style={{
                clipPath: "circle(50% at 50% 50%)",
                overflow: "visible",
              }}
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
            <Image
              src="/hair-strand.png"
              alt="Hair Strand"
              width={100}
              height={40}
              className="absolute top-[140px] left-[85px] -translate-x-1/2 transform -rotate-[7deg] scale-[1.40] z-0 blur-sm opacity-80"
            />
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

          <div className="flex space-x-4 mt-6">
            <a
              href="https://www.linkedin.com/in/monika-dvorackova/?locale=en_US"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <FaLinkedin
                size={20}
                className="text-blue-600 hover:scale-110 transition-transform duration-300"
              />
            </a>
            <a
              href="https://github.com/monikadvorackova"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <FaGithub
                size={20}
                className="text-blue-600 hover:scale-110 transition-transform duration-300"
              />
            </a>
            <a
              href="https://arxiv.org/search/?searchtype=author&query=Dvorackova%2C+M"
              target="_blank"
              rel="noopener noreferrer"
              title="arXiv"
            >
              <ArxivIcon
                size={20}
                className="text-blue-600 hover:scale-110 transition-transform duration-300"
              />
            </a>
            <a
              href="mailto:monika.dvorack@gmail.com"
              title="Send Email"
            >
              <FaEnvelope
                size={20}
                className="text-blue-600 hover:scale-110 transition-transform duration-300"
              />
            </a>
            <a
              href="/blog"
              title="Blog"
            >
              <FaFileAlt
                size={20}
                className="text-blue-600 hover:scale-110 transition-transform duration-300"
              />
            </a>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="text-base md:text-lg font-normal mb-2 hover:scale-110 transition-transform duration-300">
              Book a consultation.
            </div>
            <div className="pt-[0.3rem]">
              <a
                href="https://calendly.com/monika-dvorack/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-all duration-300"
                title="Book via Calendly"
              >
                <FaCalendarAlt
                  size={20}
                  className="text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1"
                />
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="text-[10px] text-neutral-500 text-center py-4">
        © 2025 Monika Dvorackova
      </footer>
    </div>
  );
}

