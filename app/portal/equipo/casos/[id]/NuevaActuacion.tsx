"use client";

import { useActionState, useEffect, useRef } from "react";
import { ErrorMsg, ExitoMsg, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { TIPOS_EVENTO, opciones } from "@/lib/db/tipos";
import { agregarActuacionAction } from "../actions";

// El cambio de estado lo escribe la base sola; ofrecerlo aquí solo serviría
// para que la línea de tiempo tenga dos versiones del mismo hecho.
const TIPOS = opciones(TIPOS_EVENTO).filter((o) => o.value !== "CAMBIO_ESTADO");

/** `datetime-local` necesita 'YYYY-MM-DDTHH:mm' en hora local, no ISO/UTC. */
function ahoraLocal() {
  const ahora = new Date();
  const desfase = ahora.getTimezoneOffset() * 60_000;
  return new Date(ahora.getTime() - desfase).toISOString().slice(0, 16);
}

export function NuevaActuacion({ casoId }: { casoId: string }) {
  const [estado, accion] = useActionState(agregarActuacionAction, SIN_ESTADO);
  const formulario = useRef<HTMLFormElement>(null);

  // Vaciar el formulario después de guardar. Sin esto, la actuación recién
  // escrita se queda en pantalla y es fácil enviarla dos veces creyendo que
  // la primera no salió.
  useEffect(() => {
    if (estado.ok) formulario.current?.reset();
  }, [estado]);

  return (
    <form ref={formulario} action={accion} className="mt-4 space-y-4">
      <input type="hidden" name="case_id" value={casoId} />
      <ErrorMsg>{estado.error}</ErrorMsg>
      <ExitoMsg>{estado.mensaje}</ExitoMsg>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          name="kind"
          label="Tipo"
          defaultValue="ACTUACION"
          opciones={TIPOS}
        />
        <Input
          name="occurred_at"
          label="Fecha del hecho"
          type="datetime-local"
          defaultValue={ahoraLocal()}
        />
      </div>

      <Input
        name="title"
        label="Resumen"
        required
        maxLength={200}
        placeholder="Ej: Radicada demanda ante el Juzgado 3 de Familia"
      />

      <Textarea
        name="detail"
        label="Detalle"
        hint="(opcional)"
        rows={3}
        maxLength={5000}
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
            Aparecerá en su portal tal como está escrita aquí.
          </span>
        </span>
      </label>

      <SubmitButton tamano="sm" pendiente="Guardando...">
        Registrar actuación
      </SubmitButton>
    </form>
  );
}
