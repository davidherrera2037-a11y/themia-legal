import { LogoMark } from "./Logo";
import { SectionHeading } from "./ui/SectionHeading";

const reasons = [
  {
    titulo: "Atención personalizada",
    detalle:
      "Tu caso lo lleva una abogada que lo conoce, no un número de radicado.",
  },
  {
    titulo: "Explicaciones claras",
    detalle:
      "Sin lenguaje complicado. Si no se entiende, no te lo hemos explicado bien.",
  },
  {
    titulo: "Confidencialidad",
    detalle: "Lo que nos cuentas queda entre nosotras. Siempre.",
  },
  {
    titulo: "Acompañamiento completo",
    detalle:
      "Desde la primera consulta hasta el cierre, sabes en qué va tu asunto.",
  },
  {
    titulo: "Presencial y virtual",
    detalle:
      "Atendemos en toda Colombia, donde te quede mejor a ti.",
  },
];

/**
 * Banda oscura a todo el ancho.
 *
 * El contraste con el papel crema marca el centro de la página: es la
 * pausa entre "esto hacemos" y "hablemos". Los cinco motivos son los
 * mismos de siempre; lo que se añade es una línea que explica cada uno,
 * porque una lista de sustantivos sueltos no convence a nadie.
 */
export function WhyChooseUs() {
  return (
    <section
      id="por-que-elegirnos"
      className="relative overflow-hidden bg-ink-deep px-6 py-20 text-cream sm:px-10 sm:py-28"
    >
      <LogoMark
        className="pointer-events-none absolute -right-16 -top-10 h-[28rem] w-auto text-cream/[0.035]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="reveal">
          <SectionHeading
            claro
            numero="02"
            rotulo="Por qué elegirnos"
            titulo="Cómo se siente trabajar con nosotras"
          />
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-x-12 gap-y-9 sm:grid-cols-2">
          {reasons.map((r, i) => (
            <li
              key={r.titulo}
              className="reveal flex gap-5 border-t border-cream/12 pt-6"
              style={{ "--retraso": `${(i % 2) * 90}ms` } as React.CSSProperties}
            >
              <span
                className="tabular shrink-0 font-display text-sm text-gold"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-lg text-gold-pale">
                  {r.titulo}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-cream/70">
                  {r.detalle}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
