"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Lo que se ve cuando algo se rompe de verdad.
 *
 * Antes no había ninguno, así que un fallo mostraba la pantalla en blanco
 * de Next con un rastro de error encima — que en producción no dice nada
 * útil y en cambio sí revela detalles del servidor.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El `digest` es la referencia que Next deja en los registros del
    // servidor. Sin él, "algo falló" es imposible de rastrear después.
    console.error("Error en la aplicación:", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-5xl text-gold">✦</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Algo no salió como esperábamos
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          El problema quedó registrado. Puedes intentarlo otra vez; si vuelve
          a pasar, escríbenos y lo revisamos.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-ink/45">
            Referencia: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
