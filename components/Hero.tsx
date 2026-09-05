import { LogoMark } from "./Logo";
import { SITIO } from "@/lib/sitio";

/**
 * Encabezado del sitio.
 *
 * El retrato va dentro de un arco: es la forma de un pórtico de juzgado,
 * y le da a la página una referencia clásica sin necesidad de ponerle
 * columnas ni martillos de juez encima.
 */
export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* Velo de oro muy tenue detrás del retrato, para que el bloque
          oscuro no aparezca recortado sobre el papel. */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[42rem] w-[42rem] translate-x-1/3 -translate-y-1/3 rounded-full bg-gold/[0.07] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-12 sm:px-10 md:grid-cols-[1.05fr_0.95fr] md:pb-28 md:pt-20">
        <div className="reveal order-2 md:order-1">
          <div className="flex items-center gap-4">
            <LogoMark className="h-14 w-auto text-gold sm:h-16" />
            <div>
              <p className="font-display text-2xl font-semibold tracking-[0.06em] text-ink sm:text-3xl">
                THEMIA LEGAL
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-px w-6 bg-gold" aria-hidden="true" />
                <p className="rotulo text-ink/70">Firma de abogadas</p>
                <span className="h-px w-6 bg-gold" aria-hidden="true" />
              </div>
            </div>
          </div>

          <h1 className="text-balance mt-9 font-display text-[length:var(--text-hero)] leading-[1.08] text-ink">
            Derecho con{" "}
            <em className="font-semibold not-italic text-gold-deep">
              propósito
            </em>
            .
            <br />
            Justicia con{" "}
            <em className="font-semibold not-italic text-gold-deep">empatía</em>
            .
          </h1>

          <p className="medida mt-7 font-display text-[length:var(--text-lead)] italic leading-relaxed text-ink/80">
            Asesoría jurídica clara, humana y efectiva. Te acompañamos en cada
            etapa para proteger lo que más importa.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#agenda"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-wide text-cream shadow-[var(--shadow-suave)] transition-all hover:bg-ink-deep hover:shadow-[var(--shadow-alzada)]"
            >
              Agenda tu consulta
            </a>
            <a
              href="#areas"
              className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-8 py-3.5 text-sm font-semibold tracking-wide text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
            >
              Ver áreas de práctica
            </a>
          </div>

          <p className="mt-8 text-sm text-ink/60">
            Atención presencial y virtual en toda Colombia ·{" "}
            <a
              href={`https://wa.me/${SITIO.telefonoInternacional}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold-deep underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-gold"
            >
              {SITIO.telefono}
            </a>
          </p>
        </div>

        <div
          className="reveal order-1 md:order-2"
          style={{ "--retraso": "120ms" } as React.CSSProperties}
        >
          <div className="relative mx-auto max-w-sm md:max-w-none">
            {/* Marco de oro desplazado: da profundidad sin sombra dura. */}
            <div
              className="arco pointer-events-none absolute -inset-3 border border-gold/35"
              aria-hidden="true"
            />

            {/*
              El logotipo real, sin recortar.

              public/images/hero.jpg es el lockup completo en apaisado
              (1050×600). Como fondo recortado a un arco vertical partía
              la palabra a media letra; ampliarlo hasta evitarlo lo dejaba
              borroso. Aquí va contenido, entero y a su proporción, sobre
              el mismo burdeos del archivo —muestreado, no aproximado—,
              así que no se ve dónde acaba la imagen y empieza el marco.

              Cuando haya una fotografía del despacho, se cambia el <img>
              por un div con `background-image: cover` y el arco, el marco
              y el pie siguen sirviendo igual.
            */}
            <div
              className="arco relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-8 overflow-hidden px-6 py-10 shadow-[var(--shadow-alzada)]"
              // Fondo plano, no degradado: es exactamente el burdeos del
              // archivo, así que el rectángulo de la imagen desaparece
              // dentro del arco. La profundidad la pone el viñeteado de
              // abajo, que va por encima de las dos capas y por tanto no
              // reabre esa costura.
              style={{ backgroundColor: "var(--color-vino)" }}
            >
              <img
                src="/images/hero.jpg"
                alt="Logotipo de Themia Legal: la figura de la justicia sosteniendo la balanza"
                width={1050}
                height={600}
                className="w-[94%] max-w-md"
              />

              <div className="relative z-10 flex flex-col items-center">
                <span className="h-px w-16 bg-gold/70" aria-hidden="true" />
                <p className="mt-5 text-center font-display text-sm italic leading-relaxed text-gold-pale/90 sm:text-base">
                  “Te escuchamos primero.
                  <br />
                  La estrategia viene después.”
                </p>
              </div>

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(105% 75% at 50% 32%, rgba(0,0,0,0) 35%, rgba(58,16,24,0.55) 78%, rgba(34,26,22,0.85) 100%)",
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
