"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ErrorMsg, ExitoMsg } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { AREAS, ESTADOS_LEAD, fechaHora, type Area } from "@/lib/db/tipos";
import { actualizarSolicitudAction } from "./actions";

export type Solicitud = {
  id: string;
  full_name: string;
  area: string;
  message: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  internal_note: string | null;
  created_at: string;
};

const TONOS: Record<string, "neutro" | "aviso" | "exito" | "oro"> = {
  NUEVA: "aviso",
  CONTACTADA: "oro",
  AGENDADA: "oro",
  CONVERTIDA: "exito",
  DESCARTADA: "neutro",
};

export function FichaSolicitud({ solicitud }: { solicitud: Solicitud }) {
  const [estado, accion] = useActionState(actualizarSolicitudAction, SIN_ESTADO);
  const [abierta, setAbierta] = useState(solicitud.status === "NUEVA");

  const area = AREAS[solicitud.area as Area] ?? solicitud.area;
  const telefono = solicitud.phone?.replace(/\D/g, "");

  // Prellena la creación de la clienta con lo que la persona ya escribió.
  const enlaceClienta = `/portal/equipo/clientes/nuevo?${new URLSearchParams({
    nombre: solicitud.full_name,
    ...(solicitud.phone ? { telefono: solicitud.phone } : {}),
    ...(solicitud.email ? { correo: solicitud.email } : {}),
  })}`;

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setAbierta((v) => !v)}
          aria-expanded={abierta}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block text-sm font-medium text-ink">
            {solicitud.full_name}
          </span>
          <span className="block text-xs text-ink/60">
            {area} · {fechaHora(solicitud.created_at)}
            {solicitud.phone ? ` · ${solicitud.phone}` : ""}
          </span>
        </button>
        <Badge tono={TONOS[solicitud.status] ?? "neutro"}>
          {ESTADOS_LEAD[solicitud.status as keyof typeof ESTADOS_LEAD] ??
            solicitud.status}
        </Badge>
      </div>

      {abierta && (
        <div className="mt-3 space-y-4 rounded-2xl bg-cream p-4">
          {solicitud.message && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">
              “{solicitud.message}”
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            {telefono && (
              <a
                href={`https://wa.me/${telefono}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-3 py-1.5 font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Escribir por WhatsApp
              </a>
            )}
            {solicitud.email && (
              <a
                href={`mailto:${solicitud.email}`}
                className="inline-flex items-center rounded-full border border-ink/20 px-3 py-1.5 font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                {solicitud.email}
              </a>
            )}
            <Link
              href={enlaceClienta}
              className="inline-flex items-center rounded-full border border-ink/20 px-3 py-1.5 font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              Crear clienta con estos datos
            </Link>
          </div>

          <form action={accion} className="space-y-3">
            <input type="hidden" name="id" value={solicitud.id} />
            <ErrorMsg>{estado.error}</ErrorMsg>
            <ExitoMsg>{estado.mensaje}</ExitoMsg>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-ink">Estado</span>
                <select
                  name="status"
                  defaultValue={solicitud.status}
                  className="rounded-xl border border-ink/20 bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                >
                  {Object.entries(ESTADOS_LEAD).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-ink">
                  Nota interna
                </span>
                <input
                  name="internal_note"
                  defaultValue={solicitud.internal_note ?? ""}
                  placeholder="Ej: llamada el martes, pide cita virtual"
                  className="w-full rounded-xl border border-ink/20 bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </label>

              <SubmitButton variante="contorno" tamano="sm" pendiente="Guardando...">
                Guardar
              </SubmitButton>
            </div>
          </form>
        </div>
      )}
    </li>
  );
}
