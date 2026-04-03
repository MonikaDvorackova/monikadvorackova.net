import { useEffect, type RefObject } from "react";

type Options = {
  speedPxPerSec?: number;
  idleResumeMs?: number;
};

/**
 * Mobile-only: horizontal marquee via compositor-friendly transform on the
 * inner track element. Overrides the container's overflowX to hidden so native
 * scroll cannot interfere with touch-driven transform gestures.
 * Desktop must not call this (pass enabled=false).
 */
export function useMobileMarqueeAutoplay(
  scrollerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  contentKey: string,
  options?: Options
) {
  const speedPxPerSec = options?.speedPxPerSec ?? 12;
  const idleResumeMs = options?.idleResumeMs ?? 1000;

  useEffect(() => {
    if (!enabled) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // The inner flex track is the only child of the scroller wrapper.
    const track = scroller.firstElementChild as HTMLElement | null;
    if (!track) return;

    // Override scroll — motion is driven by transform, not scrollLeft.
    // Prevents iOS native scroll from fighting our touch-gesture transform.
    const prevOverflowX = scroller.style.overflowX;
    scroller.style.overflowX = "hidden";
    // Promote to its own compositor layer so transform runs off the main thread.
    track.style.willChange = "transform";

    let raf = 0;
    let last = performance.now();
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    // Pure JS float accumulator — never read from the DOM.
    // scrollLeft would be rounded to integers by iOS Safari, stalling sub-pixel
    // accumulation. transform accepts floats and is compositor-driven.
    let pos = 0;
    // Cached half-width of the duplicated track; the seamless wrap boundary.
    // Recomputed on resize.
    let loopW = 0;
    // Touch gesture state.
    let touchStartX = 0;
    let posAtTouchStart = 0;

    const computeLoopW = () => {
      loopW = track.scrollWidth / 2;
    };

    const applyTransform = (p: number) => {
      track.style.transform = `translate3d(${-p}px, 0, 0)`;
    };

    const clearResume = () => {
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const bumpIdle = () => {
      clearResume();
      resumeTimer = setTimeout(() => {
        paused = false;
        last = performance.now();
      }, idleResumeMs);
    };

    // --- Touch gesture handlers ---
    // touchstart/move/end drive the transform directly, no scroll involvement.

    const onTouchStart = (e: TouchEvent) => {
      paused = true;
      clearResume();
      touchStartX = e.touches[0].clientX;
      posAtTouchStart = pos;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (loopW <= 0) return;
      const delta = touchStartX - e.touches[0].clientX;
      // Normalise into [0, loopW) — handles forward and backward swipes.
      pos = ((posAtTouchStart + delta) % loopW + loopW) % loopW;
      applyTransform(pos);
    };

    const onTouchEnd = () => {
      bumpIdle();
    };

    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: true });
    scroller.addEventListener("touchend", onTouchEnd, { passive: true });
    scroller.addEventListener("touchcancel", onTouchEnd, { passive: true });

    type DocWithFonts = Document & { fonts?: { ready: Promise<void> } };
    const fontsReady =
      ((document as DocWithFonts).fonts?.ready) ?? Promise.resolve();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused && loopW > 0) {
        pos += speedPxPerSec * dt;
        while (pos >= loopW) pos -= loopW;
        applyTransform(pos);
      }

      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      computeLoopW();
      last = performance.now();
    });
    ro.observe(scroller);

    const start = () => {
      computeLoopW();
      pos = 0;
      applyTransform(0);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    fontsReady.then(start);

    return () => {
      cancelAnimationFrame(raf);
      clearResume();
      ro.disconnect();
      track.style.transform = "";
      track.style.willChange = "";
      scroller.style.overflowX = prevOverflowX;
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
      scroller.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, contentKey, scrollerRef, speedPxPerSec, idleResumeMs]);
}
