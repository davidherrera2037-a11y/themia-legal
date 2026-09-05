"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { AREAS, ESTADOS_CASO, PRIORIDADES, opciones } from "@/lib/db/tipos";

const ESTADOS = Object.entries(ESTADOS_CASO).map(([value, l]) => ({
  value,
  label: l.equipo,
}));

const CONTROL =
  "rounded-xl border border-ink/20 bg-cream px-3 py-2 text-sm text-ink outline-none " +
  "transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30";

/**
 * Filtros del listado de casos.
 *
 * Viven en la URL y no en el estado del componente: así un filtro se puede
 * guardar en favoritos, mandar por chat a otra abogada y sobrevivir a
 * recargar la página. El listado sigue siendo un componente de servidor.
 */
export function FiltrosCasos() {
  const router = useRouter();
  const params = useSearchParams();

  function cambiar(clave: string, valor: string) {
    const siguientes = new URLSearchParams(params.toString());
    if (valor) siguientes.set(clave, valor);
    else siguientes.delete(clave);
    router.replace(`/portal/equipo/casos?${siguientes.toString()}`);
  }

  const hayFiltros = ["estado", "area", "prioridad", "q", "cerrados"].some((k) =>
    params.get(k),
  );

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-wrap items-center gap-2"
    >
      <label className="relative flex-1 basis-56">
        <span className="sr-only">Buscar por caso o clienta</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          aria-hidden="true"
        />
        <input
          type="search"
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => cambiar("q", e.target.value)}
          placeholder="Buscar por caso o clienta"
          className={`${CONTROL} w-full pl-9`}
        />
      </label>

      <label>
        <span className="sr-only">Estado</span>
        <select
          value={params.get("estado") ?? ""}
          onChange={(e) => cambiar("estado", e.target.value)}
          className={CONTROL}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Área</span>
        <select
          value={params.get("area") ?? ""}
          onChange={(e) => cambiar("area", e.target.value)}
          className={CONTROL}
        >
          <option value="">Todas las áreas</option>
          {opciones(AREAS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Prioridad</span>
        <select
          value={params.get("prioridad") ?? ""}
          onChange={(e) => cambiar("prioridad", e.target.value)}
          className={CONTROL}
        >
          <option value="">Toda prioridad</option>
          {opciones(PRIORIDADES).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 px-1 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={Boolean(params.get("cerrados"))}
          onChange={(e) => cambiar("cerrados", e.target.checked ? "1" : "")}
          className="h-4 w-4 rounded border-ink/30 accent-[var(--color-gold)]"
        />
        Ver cerrados
      </label>

      {hayFiltros && (
        <button
          type="button"
          onClick={() => router.replace("/portal/equipo/casos")}
          className="flex items-center gap-1 rounded-full px-3 py-2 text-xs text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Limpiar
        </button>
      )}
    </form>
  );
}
