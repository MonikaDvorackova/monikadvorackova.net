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
  /** True only for the scroll event(s) immediately following our own scrollLeft / scrollTo writes. */
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
    /** Position we last applied in the autoplay loop (ignore scroll noise from our own updates). */
    let autoplayAnchor = scroller.scrollLeft;

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
        isProgrammaticScrollRef.current = false;
        autoplayAnchor = scroller.scrollLeft;
        return;
      }
      if (touching) return;

      if (paused) {
        bumpIdle();
        return;
      }

      const diff = Math.abs(scroller.scrollLeft - autoplayAnchor);
      if (diff < 3) {
        autoplayAnchor = scroller.scrollLeft;
        return;
      }

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
          isProgrammaticScrollRef.current = true;
          while (scroller.scrollLeft >= loopW) {
            scroller.scrollLeft -= loopW;
          }
          let next = scroller.scrollLeft + speedPxPerSec * dt;
          while (next >= loopW) next -= loopW;
          autoplayAnchor = next;
          scroller.scrollTo({ left: next, behavior: "auto" });
        }
      }

      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      last = performance.now();
    });
    ro.observe(scroller);

    const start = () => {
      autoplayAnchor = scroller.scrollLeft;
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
