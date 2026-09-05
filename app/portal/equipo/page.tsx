import Link from "next/link";
import { AlertTriangle, Briefcase, CalendarClock, Inbox } from "lucide-react";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Vacio } from "@/components/ui/Card";
import { FilaPlazo, diasQueFaltan, type Plazo } from "@/components/portal/Plazo";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import {
  AREAS,
  ESTADOS_CASO,
  ESTADOS_REQUIEREN_ACCION,
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

function Indicador({
  icono: Icono,
  valor,
  label,
  href,
  destacado,
}: {
  icono: typeof Briefcase;
  valor: number;
  label: string;
  href: string;
  destacado?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-2xl border p-5 transition-colors ${
        destacado && valor > 0
          ? "border-gold bg-gold-pale/50 hover:bg-gold-pale"
          : "border-ink/10 bg-cream-soft hover:border-ink/25"
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-gold-pale">
        <Icono className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span>
        <span className="block font-display text-2xl font-semibold text-ink">
          {valor}
        </span>
        <span className="block text-xs leading-tight text-ink/65">{label}</span>
      </span>
    </Link>
  );
}

export default async function TableroPage() {
  const profile = await requireEquipo();
  const supabase = await createClient();

  // Todo lo del tablero sale de tres consultas. RLS ya recortó las filas
  // que esta persona no puede ver, así que contar aquí es contar lo suyo.
  const [{ data: casos }, { count: solicitudes }, { data: plazos }] =
    await Promise.all([
      supabase
        .from("cases")
        .select("id, title, area, status, priority, updated_at, clients(full_name)")
        .order("updated_at", { ascending: false }),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "NUEVA"),
      supabase
        .from("deadlines")
        .select(
          "id, case_id, title, kind, due_date, base_date, business_days, status, notes, visible_para_cliente, cases(title, clients(full_name))",
        )
        .eq("status", "PENDIENTE")
        .order("due_date", { ascending: true }),
    ]);

  const lista = (casos ?? []) as unknown as FilaCaso[];

  // Los vencimientos mandan sobre todo lo demás: un término que se pasa no
  // se recupera, y un caso sin mover, sí.
  const listaPlazos = (plazos ?? []) as unknown as Plazo[];
  const apremian = listaPlazos.filter((p) => diasQueFaltan(p.due_date) <= 2);
  const abiertos = lista.filter((c) => estaAbierto(c.status));
  const urgentes = abiertos.filter(
    (c) => c.priority === "URGENTE" || c.priority === "ALTA",
  );
  const requierenAccion = abiertos.filter((c) =>
    (ESTADOS_REQUIEREN_ACCION as readonly string[]).includes(c.status),
  );

  // Cuántos casos abiertos hay por área. Sirve para ver de un vistazo en
  // qué está puesto el despacho, que no siempre es donde uno cree.
  const porArea = Object.keys(AREAS)
    .map((area) => ({
      area: area as Area,
      total: abiertos.filter((c) => c.area === area).length,
    }))
    .filter((f) => f.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Bienvenida{profile.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Esto es lo que hay sobre la mesa hoy.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador
          icono={Inbox}
          valor={solicitudes ?? 0}
          label="Solicitudes sin atender"
          href="/portal/equipo/solicitudes"
          destacado
        />
        <Indicador
          icono={Briefcase}
          valor={abiertos.length}
          label="Casos abiertos"
          href="/portal/equipo/casos"
        />
        <Indicador
          icono={AlertTriangle}
          valor={urgentes.length}
          label="Prioridad alta o urgente"
          href="/portal/equipo/casos?prioridad=URGENTE"
          destacado
        />
        <Indicador
          icono={CalendarClock}
          valor={apremian.length}
          label="Vencen en 2 días hábiles o menos"
          href="/portal/equipo/plazos"
          destacado
        />
      </div>

      {apremian.length > 0 && (
        <Card className="border-gold/50 bg-gold-pale/30 p-4 sm:p-6">
          <CardTitle hint={`${apremian.length}`}>Lo que apremia</CardTitle>
          <p className="mt-1 text-xs text-ink/60">
            Contado en días hábiles, descontando los festivos de Colombia.
          </p>
          <ul className="mt-2 divide-y divide-ink/10">
            {apremian.slice(0, 6).map((pl) => (
              <FilaPlazo key={pl.id} plazo={pl} conCaso />
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle hint={`${requierenAccion.length} en cola`}>
            Esperan un primer movimiento
          </CardTitle>
          <p className="mt-1 text-xs text-ink/55">
            Casos en contacto inicial, consulta o análisis: la pelota está de
            este lado.
          </p>

          {requierenAccion.length === 0 ? (
            <div className="mt-4">
              <Vacio>Nada pendiente de arrancar. Buen momento.</Vacio>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10">
              {requierenAccion.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/portal/equipo/casos/${c.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:text-ink"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {c.title}
                      </span>
                      <span className="block text-xs text-ink/60">
                        {c.clients?.full_name ?? "(sin clienta)"} ·{" "}
                        {AREAS[c.area as Area] ?? c.area} · movido{" "}
                        {fechaCorta(c.updated_at)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
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

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/portal/equipo/casos/nuevo" tamano="sm">
              + Nuevo caso
            </ButtonLink>
            <ButtonLink
              href="/portal/equipo/clientes/nuevo"
              variante="contorno"
              tamano="sm"
            >
              + Nueva clienta
            </ButtonLink>
          </div>
        </Card>

        <Card>
          <CardTitle>Carga por área</CardTitle>
          {porArea.length === 0 ? (
            <div className="mt-4">
              <Vacio>Todavía no hay casos abiertos.</Vacio>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {porArea.map(({ area, total }) => {
                const proporcion = Math.round((total / abiertos.length) * 100);
                return (
                  <li key={area}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-ink/80">{AREAS[area]}</span>
                      <span className="font-medium text-ink">{total}</span>
                    </div>
                    <div
                      className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10"
                      role="presentation"
                    >
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${proporcion}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
