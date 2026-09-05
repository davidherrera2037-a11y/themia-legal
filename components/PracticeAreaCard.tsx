import type { LucideIcon } from "lucide-react";

export type PracticeArea = {
  title: string;
  slug: string;
  icon: LucideIcon;
  items: string[];
};

/**
 * Tarjeta de un área de práctica.
 *
 * Antes era un icono suelto con una lista debajo. Ahora es una ficha con
 * borde: cada área queda delimitada, lo que hace que siete de ellas se
 * lean como un catálogo ordenado y no como una pared de texto.
 */
export function PracticeAreaCard({
  title,
  slug,
  icon: Icon,
  items,
  numero,
  retraso = 0,
}: PracticeArea & { numero: string; retraso?: number }) {
  return (
    <article
      id={slug}
      className="reveal group relative flex h-full flex-col rounded-2xl border border-ink/10 bg-cream-soft/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/45 hover:bg-cream-soft hover:shadow-[var(--shadow-alzada)]"
      style={{ "--retraso": `${retraso}ms` } as React.CSSProperties}
    >
      <span
        className="tabular absolute right-6 top-6 font-display text-sm text-ink/20 transition-colors group-hover:text-gold/60"
        aria-hidden="true"
      >
        {numero}
      </span>

      <span className="arco flex h-14 w-12 items-center justify-center bg-ink text-gold-pale transition-colors duration-300 group-hover:bg-ink-deep">
        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      </span>

      <h3 className="mt-5 font-display text-lg leading-snug text-ink">
        {title}
      </h3>

      <span
        className="mt-3 block h-px w-10 bg-gold/50 transition-all duration-300 group-hover:w-16 group-hover:bg-gold"
        aria-hidden="true"
      />

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-snug text-ink/75">
            <span
              className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-gold"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
