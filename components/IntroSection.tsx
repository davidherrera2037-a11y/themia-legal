import { Filete } from "./ui/SectionHeading";

/**
 * Declaración de principios, entre el encabezado y el catálogo.
 *
 * Es una pausa deliberada: da respiro después del bloque grande del
 * encabezado y fija el tono antes de entrar en la lista de servicios.
 */
export function IntroSection() {
  return (
    <section className="reveal border-y border-ink/[0.07] bg-cream-deep/45 px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <Filete />
        <p className="text-balance mt-8 font-display text-[length:var(--text-lead)] leading-[1.75] text-ink sm:text-2xl sm:leading-[1.65]">
          Te acompañamos en cada etapa, con soluciones jurídicas
          personalizadas y confiables para{" "}
          <em className="font-semibold not-italic text-gold-deep">
            proteger lo que más importa
          </em>
          .
        </p>
        <p className="rotulo mt-8 text-ink/45">
          Themia Legal · Firma de abogadas · Colombia
        </p>
      </div>
    </section>
  );
}
