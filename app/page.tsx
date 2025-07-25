"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaLinkedin, FaGithub, FaCalendarAlt, FaEnvelope } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ArxivIcon from "../components/ArxivIcon";

const aiWords = ["AI", "LLM Engineering", "AI Strategy", "AI Infrastructure"];
const mlWords = ["Machine Learning", "Deep Learning", "Model Deployment"];
const lawWords = ["Lawyering", "Legal AI", "Tech Ethics", "Compliance"];

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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 transition-colors duration-500 bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark overflow-visible">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center space-y-6 z-10"
      >
        {/* Fotka + pramínek */}
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

          {/* Pramínek pod kruhem */}
          <Image
            src="/hair-strand.png"
            alt="Hair Strand"
            width={100}
            height={40}
            className="absolute top-[140px] left-[85px] -translate-x-1/2 transform -rotate-[7deg] scale-[1.40] z-0 blur-sm opacity-80"
          />
        </div>

        {/* Jméno */}
        <motion.h1
          whileHover={{ scale: 1.02 }}
          style={{ fontSize: "1.10rem", lineHeight: "1.1" }}
          className="font-medium hover:scale-110 transition-transform duration-300 tracking-tight"
        >
          Ing. et Ing. Mgr. Monika Dvorackova
        </motion.h1>

        {/* Popis */}
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

        {/* Ikony */}
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

        {/* Call to action */}
        <div className="mt-6 flex flex-col items-center">
          <div className="text-base md:text-lg font-normal mb-2 hover:scale-110 transition-transform duration-300">
            Book a consultation.
          </div>
          <div className="pt-[0.3rem]">
          <a
  href="https://calendly.com/monika-dvorack/15min"
  target="_blank"
  rel="noopener noreferrer"
  className="group bg-gradient-to-r from-blue-600 to-blue-400 text-white p-3 rounded-md shadow-md transition-all duration-300 rounded-md"
  title="Book via Calendly"
>
  <FaCalendarAlt
    size={20}
    className="transition-all duration-300 group-hover:scale-110 group-hover:translate-y-1"
  />
</a>
</div>
        </div>
      </motion.div>
    </main>
  );
}
