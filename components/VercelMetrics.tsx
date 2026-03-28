"use client";

import dynamic from "next/dynamic";

const SpeedInsights = dynamic(
  () =>
    import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false }
);

const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false }
);

export default function VercelMetrics() {
  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
