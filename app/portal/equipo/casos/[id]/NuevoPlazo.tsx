"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ErrorMsg, ExitoMsg, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { TIPOS_PLAZO, opciones } from "@/lib/db/tipos";
import {
  calcularVencimientoAction,
  crearPlazoAction,
} from "../plazos-actions";

const MODOS = [
  { value: "habiles", label: "Contar días hábiles" },
  { value: "fecha", label: "Poner una fecha" },
];

export function NuevoPlazo({ casoId, hoy }: { casoId: string; hoy: string }) {
  const [estado, accion] = useActionState(crearPlazoAction, SIN_ESTADO);
  const formulario = useRef<HTMLFormElement>(null);

  const [modo, setModo] = useState("habiles");
  const [desde, setDesde] = useState(hoy);
  const [dias, setDias] = useState("3");
  const [vista, setVista] = useState<{ iso?: string; error?: string }>({});

  // La vista previa la calcula el servidor, que es donde vive el
  // calendario de festivos. Así lo que se enseña antes de guardar es
  // exactamente lo que se va a guardar, y el navegador no tiene que
  // descargarse las reglas de la Ley Emiliani.
  useEffect(() => {
    if (modo !== "habiles") return setVista({});
    const n = Number(dias);
    if (!desde || !Number.isInteger(n) || n < 1) return setVista({});
    let vigente = true;
    calcularVencimientoAction(desde, n).then((r) => {
      if (vigente) setVista(r);
    });
    return () => {
      vigente = false;
    };
  }, [modo, desde, dias]);

  useEffect(() => {
    if (estado.ok) {
      formulario.current?.reset();
      setModo("habiles");
      setDesde(hoy);
      setDias("3");
    }
  }, [estado, hoy]);

  return (
    <form ref={formulario} action={accion} className="mt-4 space-y-4">
      <input type="hidden" name="case_id" value={casoId} />
      <input type="hidden" name="modo" value={modo} />
      <ErrorMsg>{estado.error}</ErrorMsg>
      <ExitoMsg>{estado.mensaje}</ExitoMsg>

      <Input
        name="title"
        label="Qué vence"
        required
        maxLength={200}
        placeholder="Ej: Contestar traslado de excepciones"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          name="kind"
          label="Tipo"
          defaultValue="TERMINO"
          opciones={opciones(TIPOS_PLAZO)}
        />
        <Select
          name="_modo"
          label="Cómo se fija"
          value={modo}
          onChange={(e) => setModo(e.target.value)}
          opciones={MODOS}
        />
      </div>

      {modo === "habiles" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="base_date"
              label="Se cuenta desde"
              type="date"
              required
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
            <Input
              name="business_days"
              label="Días hábiles"
              type="number"
              min={1}
              max={365}
              required
              value={dias}
              onChange={(e) => setDias(e.target.value)}
            />
          </div>

          <div
            aria-live="polite"
            className={`rounded-xl border px-4 py-3 text-sm ${
              vista.error
                ? "border-amber-800/25 bg-amber-50 text-amber-900"
                : "border-gold/40 bg-gold-pale/40 text-ink/85"
            }`}
          >
            {vista.error ? (
              vista.error
            ) : vista.iso ? (
              <>
                Vence el{" "}
                <strong className="font-semibold">
                  {new Intl.DateTimeFormat("es-CO", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(`${vista.iso}T12:00:00Z`))}
                </strong>
                <span className="mt-0.5 block text-xs text-ink/60">
                  Descontando fines de semana y los festivos de Colombia.
                </span>
              </>
            ) : (
              <span className="text-ink/55">
                Indica desde cuándo se cuenta y cuántos días hábiles.
              </span>
            )}
          </div>
        </>
      ) : (
        <Input
          name="due_date"
          label="Fecha de vencimiento"
          type="date"
          required
          defaultValue={hoy}
        />
      )}

      <Textarea
        name="notes"
        label="Nota"
        hint="(opcional)"
        rows={2}
        maxLength={2000}
        placeholder="Ej: radicado 2026-00123, Juzgado 3 de Familia"
      />

      <label className="flex items-start gap-2.5 text-sm text-ink/80">
        <input
          type="checkbox"
          name="visible_para_cliente"
          className="mt-0.5 h-4 w-4 rounded border-ink/30 accent-[var(--color-gold)]"
        />
        <span>
          Compartir con la clienta
          <span className="block text-xs text-ink/55">
            Útil para audiencias y pagos. Los términos internos no suelen
            compartirse.
          </span>
        </span>
      </label>

      <SubmitButton tamano="sm" pendiente="Guardando...">
        Registrar plazo
      </SubmitButton>
    </form>
  );
}
