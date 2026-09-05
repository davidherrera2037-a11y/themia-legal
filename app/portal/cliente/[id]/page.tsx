import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Vacio } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LineaTiempo, type Evento } from "@/components/portal/LineaTiempo";
import {
  AREAS,
  ESTADOS_CASO,
  fechaCorta,
  type Area,
  type EstadoCaso,
} from "@/lib/db/tipos";

export default async function DetalleAsuntoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["CLIENTE"]);
  const { id } = await params;

  const supabase = await createClient();

  // Sin filtro por dueño a propósito: la política `cases_select_own` ya lo
  // hace en la base. Si el caso no es suyo, esta consulta no devuelve nada
  // y la pantalla es un 404 — no un "no tienes permiso", que ya confirmaría
  // que el caso existe.
  const { data: caso } = await supabase
    .from("cases")
    .select("id, title, area, status, description, client_objective, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!caso) notFound();

  // La política `case_events_select_own` deja pasar únicamente lo marcado
  // como visible. Lo interno no llega hasta aquí.
  const { data: eventos } = await supabase
    .from("case_events")
    .select("id, kind, title, detail, occurred_at, author_name, visible_para_cliente")
    .eq("case_id", id)
    .order("occurred_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/portal/cliente" className="text-sm text-ink/60 hover:text-ink">
          ← Volver a mis asuntos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {caso.title}
          </h1>
          <Badge tono="oro">{AREAS[caso.area as Area] ?? caso.area}</Badge>
        </div>
      </div>

      <Card>
        <CardTitle>En qué va</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-ink/80">
          {ESTADOS_CASO[caso.status as EstadoCaso]?.cliente ??
            "Tu proceso continúa en trámite."}
        </p>
        <p className="mt-3 text-xs text-ink/50">
          Abierto el {fechaCorta(caso.created_at)} · última actualización{" "}
          {fechaCorta(caso.updated_at)}
        </p>
      </Card>

      {caso.client_objective && (
        <Card>
          <CardTitle>Lo que buscas con este caso</CardTitle>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">
            {caso.client_objective}
          </p>
          <p className="mt-3 text-xs text-ink/50">
            Si esto ya no refleja lo que necesitas, dínoslo y lo ajustamos.
          </p>
        </Card>
      )}

      <Card>
        <CardTitle>Historial</CardTitle>
        <div className="mt-4">
          {!eventos || eventos.length === 0 ? (
            <Vacio>
              Todavía no hay novedades para compartir. Te avisamos en cuanto
              haya un movimiento.
            </Vacio>
          ) : (
            <LineaTiempo eventos={eventos as Evento[]} />
          )}
        </div>
      </Card>
    </div>
  );
}
