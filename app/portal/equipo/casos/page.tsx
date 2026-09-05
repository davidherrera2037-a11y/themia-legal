import Link from "next/link";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, Vacio } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FiltrosCasos } from "./FiltrosCasos";
import {
  AREAS,
  ESTADOS_CASO,
  PRIORIDADES,
  TONO_PRIORIDAD,
  estaAbierto,
  fechaCorta,
  type Area,
  type EstadoCaso,
  type Prioridad,
} from "@/lib/db/tipos";

type FilaCaso = {
  id: string;
  title: string;
  area: string;
  status: string;
  priority: string;
  updated_at: string;
  clients: { full_name: string } | null;
};

type Filtros = {
  estado?: string;
  area?: string;
  prioridad?: string;
  q?: string;
  cerrados?: string;
};

export default async function CasosPage({
  searchParams,
}: {
  searchParams: Promise<Filtros>;
}) {
  await requireEquipo();
  const filtros = await searchParams;

  const supabase = await createClient();
  let consulta = supabase
    .from("cases")
    .select("id, title, area, status, priority, updated_at, clients(full_name)")
    .order("updated_at", { ascending: false });

  // Los filtros exactos se hacen en la base: traer todo y descartar en el
  // servidor funciona con veinte casos y deja de funcionar con dos mil.
  if (filtros.estado) consulta = consulta.eq("status", filtros.estado);
  if (filtros.area) consulta = consulta.eq("area", filtros.area);
  if (filtros.prioridad) consulta = consulta.eq("priority", filtros.prioridad);

  const { data, error } = await consulta;
  let casos = (data ?? []) as unknown as FilaCaso[];

  // Por defecto no se muestran los cerrados ni los archivados: el listado
  // es para trabajar, no para consultar el histórico.
  if (!filtros.cerrados && !filtros.estado) {
    casos = casos.filter((c) => estaAbierto(c.status));
  }

  // La búsqueda sí se hace aquí: cruza el título del caso con el nombre de
  // la clienta, que vienen de dos tablas, y una sola consulta que haga las
  // dos cosas obligaría a una vista en la base. No compensa todavía.
  const busqueda = filtros.q?.trim().toLowerCase();
  if (busqueda) {
    casos = casos.filter(
      (c) =>
        c.title.toLowerCase().includes(busqueda) ||
        (c.clients?.full_name ?? "").toLowerCase().includes(busqueda),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Casos</h1>
          <p className="mt-1 text-sm text-ink/60">
            {casos.length}{" "}
            {casos.length === 1 ? "caso visible" : "casos visibles"}
            {!filtros.cerrados && !filtros.estado
              ? " · cerrados y archivados ocultos"
              : ""}
          </p>
        </div>
        <ButtonLink href="/portal/equipo/casos/nuevo">+ Nuevo caso</ButtonLink>
      </div>

      <FiltrosCasos />

      <Card className="p-4 sm:p-5">
        {error ? (
          <Vacio>
            No se pudieron cargar los casos. Vuelve a intentarlo en un momento.
          </Vacio>
        ) : casos.length === 0 ? (
          <Vacio>
            Ningún caso coincide. Prueba a limpiar los filtros, o crea el
            primero con el botón de arriba.
          </Vacio>
        ) : (
          <ul className="divide-y divide-ink/10">
            {casos.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/portal/equipo/casos/${c.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-ink/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {c.title}
                    </span>
                    <span className="block text-xs text-ink/60">
                      {c.clients?.full_name ?? "(sin clienta)"} ·{" "}
                      {AREAS[c.area as Area] ?? c.area} · movido{" "}
                      {fechaCorta(c.updated_at)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tono={TONO_PRIORIDAD[c.priority as Prioridad]}>
                      {PRIORIDADES[c.priority as Prioridad] ?? c.priority}
                    </Badge>
                    <Badge tono="oro">
                      {ESTADOS_CASO[c.status as EstadoCaso]?.equipo ?? c.status}
                    </Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
