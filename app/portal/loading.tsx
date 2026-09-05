import { Card } from "@/components/ui/Card";

/**
 * Esqueleto mientras el portal consulta la base.
 *
 * Sin esto, cambiar de pantalla deja la anterior congelada unos cientos de
 * milisegundos y parece que el clic no hizo nada.
 */
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando...</span>
      <div className="h-8 w-56 animate-pulse rounded-lg bg-ink/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-ink/10 bg-cream-soft"
          />
        ))}
      </div>
      <Card>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-ink/5" />
          ))}
        </div>
      </Card>
    </div>
  );
}
