import Link from "next/link";
import { CalendarClock, Gavel, Handshake, Wallet, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  ESTADOS_PLAZO,
  TIPOS_PLAZO,
  TONO_URGENCIA,
  textoUrgencia,
  urgenciaDe,
  type EstadoPlazo,
  type TipoPlazo,
} from "@/lib/db/tipos";
import { desdeISO, fechaCortaISO, habilesEntre, hoyEnColombia } from "@/lib/legal/festivos";

export type Plazo = {
  id: string;
  case_id: string;
  title: string;
  kind: string;
  due_date: string;
  base_date: string | null;
  business_days: number | null;
  status: string;
  notes: string | null;
  visible_para_cliente: boolean;
  cases?: { title: string; clients: { full_name: string } | null } | null;
};

const ICONOS: Record<TipoPlazo, typeof CalendarClock> = {
  TERMINO: CalendarClock,
  AUDIENCIA: Gavel,
  REUNION: Handshake,
  PAGO: Wallet,
  OTRO: CircleDot,
};

/** Los días hábiles que faltan, contados desde hoy en Colombia. */
export function diasQueFaltan(iso: string): number {
  return habilesEntre(hoyEnColombia(), desdeISO(iso));
}

/**
 * Una línea de plazo.
 *
 * La cuenta atrás se muestra en días hábiles y no naturales: es como
 * cuenta el juzgado, y decir "quedan 4 días" un jueves cuando en realidad
 * quedan dos hábiles es peor que no decir nada.
 */
export function FilaPlazo({
  plazo,
  conCaso = false,
  accion,
}: {
  plazo: Plazo;
  /** Mostrar a qué caso pertenece (en la bandeja general). */
  conCaso?: boolean;
  accion?: React.ReactNode;
}) {
  const Icono = ICONOS[plazo.kind as TipoPlazo] ?? CircleDot;
  const pendiente = plazo.status === "PENDIENTE";
  const dias = diasQueFaltan(plazo.due_date);
  const urgencia = urgenciaDe(dias);

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3.5">
      <div className="flex min-w-0 flex-1 gap-3">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            pendiente && (urgencia === "vencido" || urgencia === "hoy")
              ? "bg-red-100 text-red-900"
              : "bg-ink/8 text-ink/70"
          }`}
        >
          <Icono className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <p
            className={`text-sm font-medium ${
              pendiente ? "text-ink" : "text-ink/50 line-through"
            }`}
          >
            {plazo.title}
          </p>

          <p className="mt-0.5 text-xs text-ink/60">
            {TIPOS_PLAZO[plazo.kind as TipoPlazo] ?? plazo.kind} ·{" "}
            {fechaCortaISO(plazo.due_date)}
            {/* De dónde salió la fecha: sin esto, un vencimiento es un
                número que hay que creerse. */}
            {plazo.base_date && plazo.business_days
              ? ` · ${plazo.business_days} días hábiles desde el ${fechaCortaISO(plazo.base_date)}`
              : ""}
          </p>

          {conCaso && plazo.cases && (
            <p className="mt-0.5 truncate text-xs text-ink/50">
              <Link
                href={`/portal/equipo/casos/${plazo.case_id}`}
                className="underline underline-offset-2 hover:text-ink"
              >
                {plazo.cases.title}
              </Link>
              {plazo.cases.clients ? ` · ${plazo.cases.clients.full_name}` : ""}
            </p>
          )}

          {plazo.notes && (
            <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/65">
              {plazo.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {plazo.visible_para_cliente && <Badge tono="exito">Visible</Badge>}
        {pendiente ? (
          <Badge tono={TONO_URGENCIA[urgencia]}>{textoUrgencia(dias)}</Badge>
        ) : (
          <Badge>{ESTADOS_PLAZO[plazo.status as EstadoPlazo] ?? plazo.status}</Badge>
        )}
        {accion}
      </div>
    </li>
  );
}
