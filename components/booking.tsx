"use client";

import { useEffect } from "react";
import { Linkedin } from "lucide-react";

type CalendlyApi = { initPopupWidget: (opts: { url: string }) => void };
type WindowWithCalendly = Window & { Calendly?: CalendlyApi };

export default function Booking() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="page-gutter-x w-full mt-10 flex flex-col items-center space-y-4">
      <a
        href="https://www.linkedin.com/in/monika-dvorackova/?locale=en_US"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-gray-300 transition"
      >
        <Linkedin size={28} />
      </a>

      <button
        type="button"
        onClick={() => {
          const w = window as WindowWithCalendly;
          const cal = w.Calendly;
          if (cal) {
            cal.initPopupWidget({
              url: "https://calendly.com/monika-dvorack/15min",
            });
          } else {
            window.open("https://calendly.com/monika-dvorack/15min", "_blank");
          }
        }}
        className="!bg-black !text-white px-6 py-2 rounded-md shadow-md hover:!bg-gray-800 transition duration-200"
      >
        Consultation
      </button>
    </section>
  );
}
