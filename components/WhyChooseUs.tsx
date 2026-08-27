import { Check } from "lucide-react";
import { LogoMark } from "./Logo";

const reasons = [
  "Atención personalizada",
  "Explicaciones claras, sin lenguaje complicado",
  "Confidencialidad",
  "Acompañamiento durante todo el proceso",
  "Atención presencial y virtual",
];

export function WhyChooseUs() {
  return (
    <div
      id="por-que-elegirnos"
      className="reveal relative overflow-hidden rounded-3xl bg-ink px-8 py-10 text-cream sm:px-10"
    >
      <LogoMark
        className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-auto text-cream/[0.06]"
        aria-hidden="true"
      />

      <h2 className="relative font-display text-xl font-semibold tracking-wide text-gold-pale sm:text-2xl">
        ¿Por qué elegirnos?
      </h2>

      <ul className="relative mt-6 space-y-4">
        {reasons.map((reason) => (
          <li key={reason} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold text-gold">
              <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="text-[15px] leading-relaxed text-cream/90">
              {reason}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
