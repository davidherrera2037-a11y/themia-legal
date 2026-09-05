import {
  ArrowRightLeft,
  FileText,
  Gavel,
  MessageSquare,
  Paperclip,
  StickyNote,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TIPOS_EVENTO, fechaHora, type TipoEvento } from "@/lib/db/tipos";

export type Evento = {
  id: string;
  kind: string;
  title: string;
  detail: string | null;
  occurred_at: string;
  author_name: string | null;
  visible_para_cliente: boolean;
};

const ICONOS: Record<TipoEvento, typeof StickyNote> = {
  NOTA: StickyNote,
  ACTUACION: FileText,
  CAMBIO_ESTADO: ArrowRightLeft,
  AUDIENCIA: Gavel,
  DOCUMENTO: Paperclip,
  COMUNICACION: MessageSquare,
};

/**
 * Línea de tiempo del expediente.
 *
 * La usan las dos caras del portal: el equipo la ve entera y la clienta ve
 * solo lo que RLS le deja pasar. Por eso el componente no filtra nada — si
 * filtrara aquí, el día que alguien lo llame sin el filtro se estaría
 * enseñando la estrategia interna. El recorte vive en la base.
 *
 * `mostrarVisibilidad` solo cambia si se dibuja la etiqueta "compartido con
 * la clienta", que a la clienta no le dice nada.
 */
export function LineaTiempo({
  eventos,
  mostrarVisibilidad = false,
}: {
  eventos: Evento[];
  mostrarVisibilidad?: boolean;
}) {
  return (
    <ol className="relative space-y-5 border-l border-ink/15 pl-6">
      {eventos.map((e) => {
        const Icono = ICONOS[e.kind as TipoEvento] ?? StickyNote;
        return (
          <li key={e.id} className="relative">
            <span
              className="absolute -left-[2.15rem] flex h-6 w-6 items-center justify-center rounded-full border border-ink/15 bg-cream text-gold"
              aria-hidden="true"
            >
              <Icono className="h-3 w-3" strokeWidth={2} />
            </span>

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-ink">{e.title}</p>
              <time
                dateTime={e.occurred_at}
                className="text-xs text-ink/50"
              >
                {fechaHora(e.occurred_at)}
              </time>
            </div>

            {e.detail && (
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink/75">
                {e.detail}
              </p>
            )}

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink/50">
                {TIPOS_EVENTO[e.kind as TipoEvento] ?? e.kind}
                {e.author_name ? ` · ${e.author_name}` : ""}
              </span>
              {mostrarVisibilidad && e.visible_para_cliente && (
                <Badge tono="exito">Visible para la clienta</Badge>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
