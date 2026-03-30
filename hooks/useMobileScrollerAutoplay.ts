"use client";

import { useLayoutEffect, type RefObject } from "react";

type Options = {
  speedPxPerSec?: number;
  idleResumeMs?: number;
  /** When true, parent must render two identical item sequences; scroll wraps at half of scrollWidth. */
  seamlessLoop?: boolean;
};

/**
 * Slow native scrollLeft autoplay for horizontal overflow containers (mobile).
 * Depends on `contentKey` so it re-attaches after async data loads (ref was null on first run).
 */
export function useMobileScrollerAutoplay(
  scrollerRef: RefObject<HTMLElement | null>,
  run: boolean,
  contentKey: string,
  options?: Options
) {
  const speedPxPerSec = options?.speedPxPerSec ?? 11;
  const idleResumeMs = options?.idleResumeMs ?? 900;
  const seamlessLoop = options?.seamlessLoop ?? false;

  useLayoutEffect(() => {
    if (!run) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    let raf = 0;
    let last = performance.now();
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let dir: 1 | -1 = 1;
    let paused = false;

    const pauseNow = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        last = performance.now();
      }, idleResumeMs);
    };

    const onPointerDown = () => pauseNow();
    const onTouchStart = () => pauseNow();
    const onWheel = () => pauseNow();

    scroller.addEventListener("pointerdown", onPointerDown, { passive: true });
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("wheel", onWheel, { passive: true });

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused) {
        const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        if (maxScroll > 0) {
          if (seamlessLoop) {
            const loopW = scroller.scrollWidth / 2;
            if (loopW > 0) {
              let next = scroller.scrollLeft + speedPxPerSec * dt;
              while (next >= loopW) {
                next -= loopW;
              }
              scroller.scrollLeft = next;
            }
          } else {
            const next = scroller.scrollLeft + dir * speedPxPerSec * dt;
            if (next >= maxScroll) {
              scroller.scrollLeft = maxScroll;
              dir = -1;
            } else if (next <= 0) {
              scroller.scrollLeft = 0;
              dir = 1;
            } else {
              scroller.scrollLeft = next;
            }
          }
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("wheel", onWheel);
    };
  }, [run, contentKey, speedPxPerSec, idleResumeMs, seamlessLoop]);
}
