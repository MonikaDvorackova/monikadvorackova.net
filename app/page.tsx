"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaLinkedin, FaGithub, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ArxivIcon from "../components/arxivicon";

const aiWords = ["AI", "LLM Engineering", "AI Strategy", "AI Infrastructure"];
const mlWords = ["Machine Learning", "Deep Learning", "Model Deployment"];
const lawWords = ["Lawyering", "Legal AI", "Tech Ethics", "Compliance"];

function CrossfadeWord({ word }: { word: string }) {
  return (
    <motion.span
      key={word}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.4 }}
      className="inline-block relative -top-[1px]"
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
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-[#6b584c] via-[#8b7467] to-[#b19d91] text-neutral-800"
    >
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-white/20 dark:bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-lg">
        {/* Profile photo */}
        <div className="relative w-48 h-48 mt-12 -mb-4 z-10">
          <div className="w-full h-full rounded-full overflow-hidden relative shadow-lg">
            <Image
              src="/portrait.jpg"
              alt="Portrait of Monika Dvorackova"
              width={192}
              height={192}
              className="object-cover object-top scale-[1.15] -translate-y-6"
              priority
            />
          </div>
        </div>

        {/* Name */}
        <motion.h1
          whileHover={{ scale: 1.02 }}
          className="text-2xl md:text-3xl font-bold hover:text-blue-700 transition-all"
        >
          Ing. et Ing. Mgr. Monika Dvorackova
        </motion.h1>

        {/* Animated sentence */}
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

        {/* Icons */}
        <div className="flex space-x-4 mt-6">
          <a
            href="https://www.linkedin.com/in/monika-dvorackova/?locale=en_US"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white p-3 rounded-full hover:scale-110 transition-transform duration-300"
            title="LinkedIn"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="https://github.com/monikadvorackova"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white p-3 rounded-full hover:scale-110 transition-transform duration-300"
            title="GitHub"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://arxiv.org/search/?searchtype=author&query=Dvorackova%2C+M"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white p-3 rounded-full hover:scale-110 transition-transform duration-300"
            title="arXiv"
          >
            <ArxivIcon size={20} />
          </a>
          <a
            href="mailto:monika.dvorack@gmail.com"
            className="bg-black text-white p-3 rounded-full hover:scale-110 transition-transform duration-300"
            title="Send Email"
          >
            <FaEnvelope size={20} />
          </a>
        </div>

        {/* Book a consultation */}
        <div className="mt-6 flex flex-col items-center">
          <div className="text-base md:text-lg font-normal mb-2">
            Book a consultation.
          </div>
          <div className="pt-[0.3rem]">
            <a
              href="https://calendly.com/monika-dvorack/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-3 rounded-md shadow-md hover:scale-110 hover:bg-blue-700 transition-transform duration-300 animate-bounce"
              title="Book via Calendly"
            >
              <FaCalendarAlt />
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
