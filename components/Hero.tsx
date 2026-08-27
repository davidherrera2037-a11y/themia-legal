import { Scale } from "lucide-react";
import { LogoMark } from "./Logo";

export function Hero() {
  return (
    <header className="relative bg-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-14 pb-20 sm:px-10 md:grid-cols-2 md:gap-12 md:pt-20 md:pb-28">
        {/* Left: wordmark + headline */}
        <div className="reveal order-2 md:order-1">
          <div className="flex items-center gap-4">
            <LogoMark className="h-16 w-auto text-gold" />
            <div>
              <p className="font-display text-3xl font-semibold tracking-wide text-ink sm:text-4xl">
                THEMIA LEGAL
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-px w-8 bg-gold" />
                <p className="text-xs font-semibold tracking-[0.25em] text-ink/80">
                  FIRMA DE ABOGADAS
                </p>
                <span className="h-px w-8 bg-gold" />
              </div>
            </div>
          </div>

          <p className="mt-3 text-gold" aria-hidden="true">
            ✦
          </p>

          <h1 className="text-balance mt-4 font-display text-4xl leading-[1.15] text-ink sm:text-5xl">
            Derecho con <span className="font-semibold italic">propósito</span>.
            <br />
            Justicia con <span className="font-semibold italic">empatía</span>.
          </h1>

          <p className="mt-6 max-w-md font-display text-lg italic leading-relaxed text-ink/85">
            Asesoría jurídica clara, humana y efectiva.
          </p>

          <a
            href="#agenda"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 font-body text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-ink-deep"
          >
            Agenda tu consulta
          </a>
        </div>

        {/* Right: image panel — swap for the real photo at public/images/hero.jpg */}
        <div className="reveal order-1 md:order-2">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-cover bg-center shadow-xl"
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgba(34,26,22,0.35), rgba(34,26,22,0.85)), url('/images/hero.jpg')",
              backgroundColor: "var(--color-ink-deep)",
            }}
          >
            {/* Decorative watermark shown until a real photo is added */}
            <Scale
              className="absolute inset-0 m-auto h-28 w-28 text-gold/40"
              strokeWidth={1}
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-6">
              <p className="font-display text-sm italic text-gold-pale/90">
                &ldquo;Derecho con propósito.&rdquo;
              </p>
              <p className="font-display text-sm italic text-gold-pale/90">
                &ldquo;Justicia con empatía.&rdquo;
              </p>
            </div>
            {/* Decorative curve echoing the wave motif from the reference design */}
            <svg
              viewBox="0 0 300 60"
              preserveAspectRatio="none"
              className="absolute -bottom-px left-0 h-10 w-2/3 text-ink/70"
              aria-hidden="true"
            >
              <path
                d="M0,20 C 80,55 160,0 300,30 L300,60 L0,60 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
