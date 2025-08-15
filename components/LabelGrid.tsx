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

type LabelGridProps = {
  labels?: string[];
  /** Optional externally controlled selection */
  selected?: string[];
  /** Toggle callback (if not provided, buttons jen vizuální) */
  onToggle?: (label: string) => void;
  /** Optional className passthrough */
  className?: string;
};

export default function LabelGrid({
  labels = DEFAULT_LABELS,
  selected,
  onToggle,
  className,
}: LabelGridProps) {
  const isSelected = (t: string) => !!selected?.includes(t);

  return (
    <div className={`w-full max-w-5xl mx-auto ${className ?? ""}`}>
      {/* Mobile: wrapované chips; md+: 3-sloupcový grid */}
      <ul
        role="list"
        className="flex flex-wrap gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3 text-center"
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
                  "w-full sm:w-auto",
                  "rounded-full border",
                  "px-4 md:px-4",
                  "h-11 md:h-10",
                  "min-w-[44px] min-h-[44px]", // WCAG tap target
                  "text-sm font-medium",
                  "transition-colors",
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
