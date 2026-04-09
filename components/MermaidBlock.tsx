"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

type MermaidBlockProps = {
  chart: string;
};

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    flowchart: {
      useMaxWidth: true,
      curve: "basis",
      htmlLabels: true,
      nodeSpacing: 36,
      rankSpacing: 58,
      padding: 14,
    },
    themeVariables: {
      background: "#ffffff",
      primaryColor: "#ffffff",
      primaryTextColor: "#111827",
      primaryBorderColor: "#cbd5e1",
      lineColor: "#94a3b8",
      secondaryColor: "#f8fafc",
      tertiaryColor: "#f8fafc",
      clusterBkg: "#f8fafc",
      clusterBorder: "#e5e7eb",
      edgeLabelBackground: "#ffffff",
      fontSize: "16px",
    },
  });

  mermaidInitialized = true;
}

export default function MermaidBlock({ chart }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      try {
        initMermaid();
        setError(null);

        const { svg } = await mermaid.render(`mermaid-${id}`, chart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to render Mermaid diagram.";
          setError(message);
        }
      }
    }

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="mb-2 font-semibold">Mermaid render error</div>
        <pre className="whitespace-pre-wrap break-words text-xs">{error}</pre>
      </div>
    );
  }

  return (
    <div className="mermaid-breakout">
      <div className="mermaid-card">
        <div ref={containerRef} className="mermaid-rendered" />
      </div>
    </div>
  );
}