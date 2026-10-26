/**
 * Soft edge fade for horizontal carousels. Prefer this over CSS `mask-image`:
 * masked ancestors often break hit-testing so links (e.g. tag pills) do not
 * receive clicks in Safari / Chrome.
 */
export default function CarouselEdgeFog() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-[clamp(12px,3vw,32px)] bg-gradient-to-r from-white/35 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-[clamp(12px,3vw,32px)] bg-gradient-to-l from-white/35 to-transparent"
        aria-hidden
      />
    </>
  );
}
