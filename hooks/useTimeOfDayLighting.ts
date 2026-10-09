"use client";

import { useEffect, useState } from "react";
import {
  getMsUntilNextPeriodBoundary,
  getTimePeriod,
  parseAmbientPreviewParam,
  type TimePeriod,
} from "@/lib/timeOfDayLighting";

const SSR_SAFE_DEFAULT: TimePeriod = "day";

export type TimeOfDayLightingState = {
  period: TimePeriod;
  /** False until the first client period is applied without animating. */
  transitionsReady: boolean;
};

/**
 * Resolves the landing-page ambient lighting period from local browser time.
 * SSR + first client paint use "day" to avoid hydration mismatch.
 * The first correction to the real local period is applied without CSS
 * transitions; transitions enable only afterward for later boundary changes.
 */
export function useTimeOfDayLighting(): TimeOfDayLightingState {
  const [period, setPeriod] = useState<TimePeriod>(SSR_SAFE_DEFAULT);
  const [transitionsReady, setTransitionsReady] = useState(false);

  useEffect(() => {
    let timeoutId: number | null = null;
    let rafOuter = 0;
    let rafInner = 0;
    let cancelled = false;

    const resolveOverride = (): TimePeriod | null => {
      if (process.env.NODE_ENV !== "development") return null;
      try {
        return parseAmbientPreviewParam(
          new URLSearchParams(window.location.search)
        );
      } catch {
        return null;
      }
    };

    const apply = () => {
      if (cancelled) return;
      const override = resolveOverride();
      setPeriod(override ?? getTimePeriod(new Date()));
    };

    const scheduleNext = () => {
      if (cancelled) return;
      if (resolveOverride()) return; // preview mode: stay fixed

      const delay = Math.max(1000, getMsUntilNextPeriodBoundary(new Date()));
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        apply();
        scheduleNext();
      }, delay);
    };

    // 1) Snap to the real local period with transitions still disabled.
    apply();

    // 2) After paint of the corrected period, enable long ambient transitions
    //    for subsequent boundary changes only.
    rafOuter = window.requestAnimationFrame(() => {
      rafInner = window.requestAnimationFrame(() => {
        if (cancelled) return;
        setTransitionsReady(true);
      });
    });

    scheduleNext();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timeoutId != null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        apply();
        scheduleNext();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timeoutId != null) window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(rafOuter);
      window.cancelAnimationFrame(rafInner);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { period, transitionsReady };
}
