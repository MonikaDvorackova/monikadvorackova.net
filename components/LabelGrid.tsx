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

export default function LabelGrid({ labels = DEFAULT_LABELS }: { labels?: string[] }) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-center">
        {labels.map((t) => (
          <li key={t} className="text-blue-700 font-medium">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
