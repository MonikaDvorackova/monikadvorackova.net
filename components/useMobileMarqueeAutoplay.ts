import { useEffect, type RefObject } from "react";

type Options = {
  speedPxPerSec?: number;
  idleResumeMs?: number;
};

/**
 * Mobile-only: autoplay advances `scroller.scrollLeft` over a duplicated row.
 * Desktop carousels use a separate transform path; this hook runs only when enabled.
 *
 * iOS often fires `scroll` asynchronously after `scrollLeft` assignment, so a
 * microtask "programmatic" flag clears before `scroll` runs and was pausing
 * autoplay every frame. We ignore pause during a short window after each write.
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

    const track = scroller.querySelector(
      "[data-marquee-track]"
    ) as HTMLElement | null;
    if (!track) return;

    let raf = 0;
    let last = performance.now();
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    let loopW = 0;

    /** True only while sync scroll handlers run during our scrollLeft assignment. */
    let applyingScroll = false;
    /** Ignore user-scroll pause until this time (async scroll on WebKit). */
    let ignoreUserScrollPauseUntil = 0;

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

    const measureLoopW = () => {
      loopW = track.scrollWidth / 2;
    };

    const setScrollLeft = (next: number) => {
      applyingScroll = true;
      ignoreUserScrollPauseUntil = performance.now() + 80;
      scroller.scrollLeft = next;
      applyingScroll = false;
    };

    const wrapScroll = () => {
      if (loopW <= 0) return;
      let sl = scroller.scrollLeft;
      while (sl >= loopW) sl -= loopW;
      if (sl !== scroller.scrollLeft) {
        applyingScroll = true;
        ignoreUserScrollPauseUntil = performance.now() + 80;
        scroller.scrollLeft = sl;
        applyingScroll = false;
      }
    };

    const onScroll = () => {
      if (applyingScroll) return;
      if (performance.now() < ignoreUserScrollPauseUntil) return;

      wrapScroll();
      paused = true;
      clearResume();
      bumpIdle();
    };

    let touchDepth = 0;
    const onTouchStart = () => {
      touchDepth += 1;
      if (touchDepth === 1) {
        paused = true;
        clearResume();
      }
    };
    const onTouchEnd = () => {
      touchDepth = Math.max(0, touchDepth - 1);
      if (touchDepth === 0) bumpIdle();
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchend", onTouchEnd, { passive: true });
    scroller.addEventListener("touchcancel", onTouchEnd, { passive: true });

    type DocWithFonts = Document & { fonts?: { ready: Promise<void> } };
    const fontsReady =
      ((document as DocWithFonts).fonts?.ready) ?? Promise.resolve();

    const loop = (now: number) => {
      if (loopW <= 0) {
        measureLoopW();
        if (loopW <= 0) {
          last = now;
          raf = requestAnimationFrame(loop);
          return;
        }
        last = now;
      }

      const dt = (now - last) / 1000;
      last = now;

      if (!paused && loopW > 0 && touchDepth === 0) {
        let sl = scroller.scrollLeft + speedPxPerSec * dt;
        while (sl >= loopW) sl -= loopW;
        setScrollLeft(sl);
      }

      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      measureLoopW();
      last = performance.now();
    });
    ro.observe(track);

    fontsReady.then(() => {
      measureLoopW();
      setScrollLeft(0);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearResume();
      ro.disconnect();
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchend", onTouchEnd);
      scroller.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, contentKey, scrollerRef, speedPxPerSec, idleResumeMs]);
}
