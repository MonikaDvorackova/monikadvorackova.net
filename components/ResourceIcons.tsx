// components/ResourceIcons.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt, FaFilePdf } from "react-icons/fa";
import { SiArxiv, SiWeightsandbiases, SiMlflow, SiGooglecolab, SiKaggle } from "react-icons/si";

export type ResourceType =
  | "github" | "arxiv" | "wandb" | "mlflow" | "model" | "website"
  | "pdf" | "dataset" | "demo" | "colab" | "kaggle";

export type Resource = { type: ResourceType | string; href: string; label?: string; };

type Props = {
  resources: Resource[];
  showLabels?: boolean;
  className?: string;
  sizeClassName?: string;   // např. "h-5 w-5"
};

function ModelIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-hidden="true">
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="6" r="2" fill="currentColor" />
      <circle cx="19" cy="18" r="2" fill="currentColor" />
      <path d="M7 12h8M17 7l-6 4M17 17l-6-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function DatasetIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function DemoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-hidden="true">
      <polygon points="9,7 18,12 9,17" fill="currentColor" />
      <rect x="4" y="5" width="2" height="14" fill="currentColor" />
    </svg>
  );
}

export default function ResourceIcons({
  resources,
  showLabels = false,
  className = "",
  sizeClassName = "h-5 w-5",
}: Props) {
  if (!resources?.length) return null;

  const iconFor = (type: string) => {
    switch (type) {
      case "github":  return <FaGithub className={sizeClassName} color="#171515" />;
      case "arxiv":   return <SiArxiv className={sizeClassName} color="#B31B1B" />;
      case "wandb":   return <SiWeightsandbiases className={sizeClassName} color="#FFBE00" />;
      case "mlflow":  return <SiMlflow className={sizeClassName} color="#0194E2" />;
      case "colab":   return <SiGooglecolab className={sizeClassName} color="#F9AB00" />;
      case "kaggle":  return <SiKaggle className={sizeClassName} color="#20BEFF" />;
      case "pdf":     return <FaFilePdf className={sizeClassName} color="#FF0000" />;
      case "website": return <FaExternalLinkAlt className={sizeClassName} color="#444444" />;
      case "model":   return <ModelIcon className={`${sizeClassName} text-neutral-900 dark:text-neutral-100`} />;
      case "dataset": return <DatasetIcon className={`${sizeClassName} text-neutral-900 dark:text-neutral-100`} />;
      case "demo":    return <DemoIcon className={`${sizeClassName} text-neutral-900 dark:text-neutral-100`} />;
      default:
        return <span className={`inline-block ${sizeClassName} text-[10px] leading-none font-semibold`}>{type.toUpperCase()}</span>;
    }
  };

  return (
    <div className={`not-prose flex items-center flex-wrap ${className}`} data-test="resource-icons">
      {resources.map((r, i) => {
        const key = `${r.type}-${r.href}-${i}`;
        const icon = iconFor((r.type || "").toLowerCase());
        const label = r.label || r.type;


        const itemStyle: React.CSSProperties = i === 0 ? {} : { marginLeft: "12px" };

        const child = (
          <span className="inline-flex items-center align-middle">
            {icon}
            {showLabels ? <span style={{ marginLeft: 8 }} className="text-xs">{label}</span> : null}
          </span>
        );

        return r.href ? (
          <Link
            key={key}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="inline-flex items-center"
            style={itemStyle}
          >
            {child}
          </Link>
        ) : (
          <span key={key} className="inline-flex items-center" style={itemStyle}>
            {child}
          </span>
        );
      })}
    </div>
  );
}
