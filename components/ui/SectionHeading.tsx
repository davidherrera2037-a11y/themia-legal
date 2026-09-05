import type { ReactNode } from "react";

/**
 * Encabezado de sección.
 *
 * Tres piezas fijas —número, rótulo y título— repetidas en todas las
 * secciones. Es lo que hace que la página se lea como un documento con
 * capítulos y no como una sucesión de bloques sueltos.
 */
export function SectionHeading({
  numero,
  rotulo,
  titulo,
  entradilla,
  centrado = false,
  claro = false,
}: {
  numero: string;
  rotulo: string;
  titulo: ReactNode;
  entradilla?: ReactNode;
  centrado?: boolean;
  /** Para secciones sobre fondo oscuro. */
  claro?: boolean;
}) {
  return (
    <div className={centrado ? "text-center" : ""}>
      <div
        className={`flex items-center gap-3 ${centrado ? "justify-center" : ""}`}
      >
        <span
          className={`tabular rotulo ${claro ? "text-gold-pale/70" : "text-gold-deep"}`}
        >
          {numero}
        </span>
        <span
          className={`h-px w-8 ${claro ? "bg-gold-pale/40" : "bg-gold/50"}`}
          aria-hidden="true"
        />
        <span className={`rotulo ${claro ? "text-cream/70" : "text-ink/55"}`}>
          {rotulo}
        </span>
      </div>

      <h2
        className={`text-balance mt-4 font-display text-[length:var(--text-titulo)] leading-[1.15] ${
          claro ? "text-gold-pale" : "text-ink"
        }`}
      >
        {titulo}
      </h2>

      {entradilla && (
        <p
          className={`medida mt-4 text-[length:var(--text-lead)] leading-relaxed ${
            centrado ? "mx-auto" : ""
          } ${claro ? "text-cream/80" : "text-ink/70"}`}
        >
          {entradilla}
        </p>
      )}
    </div>
  );
}

/** Filete de oro con un rombo al centro. Separa secciones sin gritar. */
export function Filete({ claro = false }: { claro?: boolean }) {
  const color = claro ? "bg-gold-pale/30" : "bg-gold/30";
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className={`h-px flex-1 ${color}`} />
      <span className={claro ? "text-gold-pale/70" : "text-gold"}>✦</span>
      <span className={`h-px flex-1 ${color}`} />
    </div>
  );
}
