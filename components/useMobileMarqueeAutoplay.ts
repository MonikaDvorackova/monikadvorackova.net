import { useEffect, type RefObject } from "react";

type Options = {
  speedPxPerSec?: number;
  idleResumeMs?: number;
};

/**
 * Mobile-only: marquee via `transform` on `[data-marquee-track]` (no `scrollLeft`).
 * Avoids iOS/WebKit issues where `scroll` events and programmatic `scrollLeft`
 * interact badly; desktop carousels use a separate path and never enable this hook.
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

    let pos = 0;
    let loopW = 0;

    let touchStartX = 0;
    let touchStartY = 0;
    let posAtTouchStart = 0;
    let touchIsHorizontalDrag = false;

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
      void track.offsetHeight;
      let half = track.scrollWidth / 2;
      if (half <= 0 && track.children.length >= 2) {
        const n = Math.floor(track.children.length / 2);
        let w = 0;
        for (let i = 0; i < n; i++) {
          const el = track.children[i] as HTMLElement;
          w += el.getBoundingClientRect().width;
        }
        const styles = window.getComputedStyle(track);
        const gap =
          parseFloat(styles.columnGap || "0") ||
          parseFloat(styles.gap || "0") ||
          8;
        w += gap * Math.max(0, n - 1);
        half = w;
      }
      loopW = half;
    };

    const applyTransform = () => {
      track.style.transform = `translate3d(${-pos}px,0,0)`;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (loopW <= 0) measureLoopW();
      touchIsHorizontalDrag = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      posAtTouchStart = pos;
      paused = true;
      clearResume();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (loopW <= 0) measureLoopW();
      if (loopW <= 0) return;

      const t = e.touches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      if (!touchIsHorizontalDrag) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        touchIsHorizontalDrag =
          Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) >= 10;
        if (!touchIsHorizontalDrag) return;
      }

      const delta = touchStartX - t.clientX;
      pos = ((posAtTouchStart + delta) % loopW + loopW) % loopW;
      applyTransform();
    };

    const onTouchEnd = () => {
      if (touchIsHorizontalDrag) bumpIdle();
      else {
        paused = false;
        last = performance.now();
      }
    };

    track.style.willChange = "transform";

    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: true });
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

      if (!paused && loopW > 0) {
        pos += speedPxPerSec * dt;
        while (pos >= loopW) pos -= loopW;
        applyTransform();
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
      pos = 0;
      applyTransform();
      paused = false;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      clearResume();
      ro.disconnect();
      track.style.transform = "";
      track.style.willChange = "";
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
      scroller.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, contentKey, scrollerRef, speedPxPerSec, idleResumeMs]);
}
