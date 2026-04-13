import { useEffect, type RefObject } from "react";

type Options = {
  speedPxPerSec?: number;
  idleResumeMs?: number;
};

/**
 * Mobile-only: horizontal marquee via transform on the inner track element.
 * Borrows the same rendering primitive as the desktop marquee (translate3d on
 * a will-change:transform layer) so motion runs on the compositor thread.
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

    // CarouselEdgeFog renders first (gradient overlays); the scrollable track is marked.
    const track = scroller.querySelector(
      "[data-marquee-track]"
    ) as HTMLElement | null;
    if (!track) return;

    // Switch to transform-driven motion. Prevent native scroll from
    // fighting the touch gesture; restore both on cleanup.
    const prevOverflowX = scroller.style.overflowX;
    scroller.style.overflowX = "hidden";
    track.style.willChange = "transform";

    let raf = 0;
    let last = performance.now();
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    // JS float accumulator — same pattern as the desktop `x` variable.
    // Never read back from the DOM; avoids iOS integer-rounding of scrollLeft.
    let pos = 0;
    // Half the total track width: the seamless loop boundary.
    // Mirrors the desktop `half = track.scrollWidth / 2` pattern.
    let loopW = 0;

    // Touch gesture state for manual swipe.
    let touchStartX = 0;
    let posAtTouchStart = 0;

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
        // pos retains its current value (last touch-driven or autoplay position).
      }, idleResumeMs);
    };

    const applyTransform = () => {
      track.style.transform = `translate3d(${-pos}px, 0, 0)`;
    };

    /** Let tag/post links receive real clicks — otherwise touchmove steals the gesture. */
    const touchTargetIsLink = (e: TouchEvent) => {
      const t = e.target;
      return t instanceof Element && Boolean(t.closest("a[href]"));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (touchTargetIsLink(e)) return;
      paused = true;
      clearResume();
      touchStartX = e.touches[0].clientX;
      posAtTouchStart = pos;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchTargetIsLink(e)) return;
      if (loopW <= 0) return;
      const delta = touchStartX - e.touches[0].clientX;
      // Normalise into [0, loopW) — handles both forward and backward swipes.
      pos = ((posAtTouchStart + delta) % loopW + loopW) % loopW;
      applyTransform();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchTargetIsLink(e)) return;
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
        applyTransform();
      }

      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      loopW = track.scrollWidth / 2;
      last = performance.now();
    });
    ro.observe(scroller);

    fontsReady.then(() => {
      loopW = track.scrollWidth / 2;
      pos = 0;
      applyTransform();
      last = performance.now();
      raf = requestAnimationFrame(loop);
    });

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
