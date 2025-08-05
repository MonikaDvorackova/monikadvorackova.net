"use client";

import { useEffect, useState } from "react";

export default function CrossfadeWord({ word }: { word: string }) {
  const [currentWord, setCurrentWord] = useState(word);
  const [previousWord, setPreviousWord] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (word === currentWord) return;

    setPreviousWord(currentWord);
    setCurrentWord(word);
    setIsFading(true);

    const timeout = setTimeout(() => {
      setPreviousWord(null);
      setIsFading(false);
    }, 500); // stejná doba jako transition

    return () => clearTimeout(timeout);
  }, [word, currentWord]); // ✅ přidáno currentWord

  return (
    <span className="relative inline-block w-full h-full">
      {previousWord && (
        <span
          className={`absolute inset-0 transition-opacity duration-500 ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {previousWord}
        </span>
      )}
      <span
        className={`transition-opacity duration-500 ${
          isFading ? "opacity-100" : "opacity-100"
        }`}
      >
        {currentWord}
      </span>
    </span>
  );
}
