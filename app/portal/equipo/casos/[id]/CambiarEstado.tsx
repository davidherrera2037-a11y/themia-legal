"use client";

import { useActionState } from "react";
import { ErrorMsg, ExitoMsg, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { ESTADOS_CASO } from "@/lib/db/tipos";
import { cambiarEstadoAction } from "../actions";

const OPCIONES = Object.entries(ESTADOS_CASO).map(([value, l]) => ({
  value,
  label: l.equipo,
}));

export function CambiarEstado({
  casoId,
  estadoActual,
}: {
  casoId: string;
  estadoActual: string;
}) {
  const [estado, accion] = useActionState(cambiarEstadoAction, SIN_ESTADO);

  return (
    <form action={accion} className="mt-4 space-y-3">
      <input type="hidden" name="case_id" value={casoId} />
      <ErrorMsg>{estado.error}</ErrorMsg>
      <ExitoMsg>{estado.mensaje}</ExitoMsg>

      <Select
        name="status"
        label="Mover a"
        defaultValue={estadoActual}
        opciones={OPCIONES}
      />

      <p className="text-xs text-ink/55">
        Cada cambio queda en la línea de tiempo y la clienta lo ve en su
        portal.
      </p>

      <SubmitButton variante="contorno" tamano="sm" pendiente="Moviendo...">
        Actualizar estado
      </SubmitButton>
    </form>
  );
}
