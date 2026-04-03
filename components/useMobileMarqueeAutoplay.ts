import { useEffect, useRef, type RefObject } from "react";

type Options = {
  speedPxPerSec?: number;
  idleResumeMs?: number;
};

/**
 * Mobile-only: horizontal marquee via scrollLeft on a duplicated row, with native swipe.
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
  /**
   * Guards the scroll event fired by our own scrollLeft write.
   * Without this, onScroll would overwrite autoplayAnchor with the
   * iOS-rounded integer value and corrupt the JS float accumulator.
   */
  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let raf = 0;
    let last = performance.now();
    let paused = false;
    let touching = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    /**
     * JS-side float position accumulator.
     * We do NOT read scroller.scrollLeft as the position source in the RAF
     * loop because iOS Safari rounds scrollLeft to integers on read.
     * At 11px/s / 60fps = 0.18px per frame, reading the rounded integer
     * each frame always returns the same value → position never advances.
     * Instead we accumulate here and only write to scrollLeft.
     */
    let autoplayAnchor = 0;

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
        // Re-sync accumulator to wherever the user ended up.
        autoplayAnchor = scroller.scrollLeft;
      }, idleResumeMs);
    };

    const onInteractionStart = () => {
      touching = true;
      paused = true;
      clearResume();
    };

    const onInteractionEnd = () => {
      touching = false;
      bumpIdle();
    };

    const onScroll = () => {
      if (isProgrammaticScrollRef.current) {
        // This scroll was fired by our own scrollLeft write — ignore it.
        // Do NOT overwrite autoplayAnchor here: it is our JS float
        // accumulator and must not be clobbered with a rounded integer.
        isProgrammaticScrollRef.current = false;
        return;
      }
      if (touching) return;

      if (paused) {
        bumpIdle();
        return;
      }

      // Genuine user scroll detected.
      paused = true;
      bumpIdle();
    };

    const onWheel = () => {
      paused = true;
      bumpIdle();
    };

    scroller.addEventListener("pointerdown", onInteractionStart, { passive: true });
    scroller.addEventListener("pointerup", onInteractionEnd, { passive: true });
    scroller.addEventListener("pointercancel", onInteractionEnd, { passive: true });
    scroller.addEventListener("touchstart", onInteractionStart, { passive: true });
    scroller.addEventListener("touchend", onInteractionEnd, { passive: true });
    scroller.addEventListener("touchcancel", onInteractionEnd, { passive: true });
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", onWheel, { passive: true });

    type DocWithFonts = Document & { fonts?: { ready: Promise<void> } };
    const fontsReady =
      ((document as DocWithFonts).fonts?.ready) ?? Promise.resolve();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused) {
        const loopW = scroller.scrollWidth / 2;
        if (loopW > 0) {
          // Advance the JS float accumulator — never read from scrollLeft.
          autoplayAnchor += speedPxPerSec * dt;
          while (autoplayAnchor >= loopW) autoplayAnchor -= loopW;

          isProgrammaticScrollRef.current = true;
          scroller.scrollLeft = autoplayAnchor;
        }
      }

      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      last = performance.now();
    });
    ro.observe(scroller);

    const start = () => {
      autoplayAnchor = 0;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    fontsReady.then(start);

    return () => {
      isProgrammaticScrollRef.current = false;
      cancelAnimationFrame(raf);
      clearResume();
      ro.disconnect();
      scroller.removeEventListener("pointerdown", onInteractionStart);
      scroller.removeEventListener("pointerup", onInteractionEnd);
      scroller.removeEventListener("pointercancel", onInteractionEnd);
      scroller.removeEventListener("touchstart", onInteractionStart);
      scroller.removeEventListener("touchend", onInteractionEnd);
      scroller.removeEventListener("touchcancel", onInteractionEnd);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", onWheel);
    };
  }, [enabled, contentKey, scrollerRef, speedPxPerSec, idleResumeMs]);
}
