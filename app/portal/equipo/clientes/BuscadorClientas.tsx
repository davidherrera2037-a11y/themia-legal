"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Búsqueda de clientas.
 *
 * Vive en la URL igual que los filtros de casos, para que un resultado se
 * pueda compartir y sobreviva a recargar.
 */
export function BuscadorClientas() {
  const router = useRouter();
  const params = useSearchParams();

  function cambiar(clave: string, valor: string) {
    const siguientes = new URLSearchParams(params.toString());
    if (valor) siguientes.set(clave, valor);
    else siguientes.delete(clave);
    router.replace(`/portal/equipo/clientes?${siguientes.toString()}`);
  }

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-wrap items-center gap-3"
    >
      <label className="relative flex-1 basis-64">
        <span className="sr-only">Buscar por nombre o documento</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          aria-hidden="true"
        />
        <input
          type="search"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => cambiar("q", e.target.value)}
          placeholder="Buscar por nombre o documento"
          className="w-full rounded-xl border border-ink/20 bg-cream py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={Boolean(params.get("inactivas"))}
          onChange={(e) => cambiar("inactivas", e.target.checked ? "1" : "")}
          className="h-4 w-4 rounded border-ink/30 accent-[var(--color-gold)]"
        />
        Ver inactivas
      </label>
    </form>
  );
}
