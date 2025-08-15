"use client";

import React from "react";

const DEFAULT_LABELS = [
  "LLM Engineering",
  "RAG Audits",
  "AI Strategy",
  "MLOps / Infra",
  "Evaluations & Guardrails",
  "AI Compliance (EU)",
  "Teaching & Advisory",
];

type Props = {
  labels?: string[];
  selected?: string[];
  onToggle?: (label: string) => void;
  className?: string;
};

export default function LabelGrid({
  labels = DEFAULT_LABELS,
  selected,
  onToggle,
  className,
}: Props) {
  const isSelected = (t: string) => !!selected?.includes(t);

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 ${className ?? ""}`}>
      {/* mobil: chips s wrapem; od sm: grid 2–3 sloupce */}
      <ul
        role="list"
        className="flex flex-wrap gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3"
      >
        {labels.map((t) => {
          const active = isSelected(t);
          return (
            <li key={t} role="listitem" className="sm:contents">
              <button
                type="button"
                onClick={onToggle ? () => onToggle(t) : undefined}
                aria-pressed={active}
                title={t}
                className={[
                  // šířka: na mobilu auto (chips), v gridu plná šířka
                  "w-auto sm:w-full",
                  // tap target 44px
                  "h-11 min-h-[44px] min-w-[44px]",
                  // padding + velikost písma adaptivně
                  "px-4 text-[clamp(12px,3.2vw,14px)] font-medium",
                  "rounded-full border transition-colors whitespace-nowrap",
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-700 border-neutral-300 hover:bg-neutral-100",
                ].join(" ")}
              >
                {t}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
