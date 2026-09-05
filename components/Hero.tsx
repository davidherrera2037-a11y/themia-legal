import { existsSync } from "node:fs";
import { join } from "node:path";
import { LogoMark } from "./Logo";
import { SITIO } from "@/lib/sitio";

/**
 * La fotografía del arco, si ya está puesta.
 *
 * Mientras no exista el archivo, el arco enseña el símbolo de la firma
 * sobre su burdeos. En cuanto se deja la foto en public/images/portada.jpg
 * el encabezado la usa sin tocar una línea de código: se comprueba al
 * compilar, así que no cuesta nada en cada visita.
 */
const RUTA_FOTO = "/images/portada.jpg";
const hayFoto = existsSync(join(process.cwd(), "public", RUTA_FOTO));

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
            <LogoMark className="h-14 text-gold sm:h-16" />
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
            <br />
            Defensa con{" "}
            <em className="font-semibold not-italic text-gold-deep">
              estrategia
            </em>
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

            {hayFoto ? (
              <div
                className="arco relative aspect-[4/5] w-full overflow-hidden bg-cover bg-center shadow-[var(--shadow-alzada)]"
                style={{
                  backgroundImage: `linear-gradient(170deg, rgba(34,26,22,0.05) 0%, rgba(34,26,22,0.35) 62%, rgba(34,26,22,0.82) 100%), url('${RUTA_FOTO}')`,
                  backgroundColor: "var(--color-vino)",
                }}
                role="img"
                aria-label="La figura de la justicia junto a los libros del despacho: derecho con propósito, justicia con empatía, defensa con estrategia"
              >
                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
                  <span
                    className="mb-4 block h-px w-12 bg-gold"
                    aria-hidden="true"
                  />
                  <p className="font-display text-base italic leading-relaxed text-gold-pale/95 sm:text-lg">
                    “Escuchamos antes
                    <br />
                    de aconsejar.”
                  </p>
                </div>
              </div>
            ) : (
              /*
                Todavía sin fotografía: el arco muestra el símbolo de la
                firma sobre el burdeos exacto de su logotipo, muestreado del
                archivo original para que no se vea la costura.
              */
              <div
                className="arco relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-9 overflow-hidden px-8 py-10 shadow-[var(--shadow-alzada)]"
                style={{ backgroundColor: "var(--color-vino)" }}
              >
                <LogoMark className="relative z-10 h-44 text-gold-pale sm:h-52" />

                <div className="relative z-10 flex flex-col items-center">
                  <span className="h-px w-16 bg-gold/70" aria-hidden="true" />
                  <p className="mt-5 text-center font-display text-sm italic leading-relaxed text-gold-pale/90 sm:text-base">
                    “Escuchamos antes
                    <br />
                    de aconsejar.”
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
