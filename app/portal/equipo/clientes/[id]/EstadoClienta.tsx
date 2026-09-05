"use client";

import { useActionState } from "react";
import { ErrorMsg, ExitoMsg } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { actualizarEstadoClientaAction } from "../actions";

export function EstadoClienta({
  clientaId,
  actual,
}: {
  clientaId: string;
  actual: string;
}) {
  const [estado, accion] = useActionState(
    actualizarEstadoClientaAction,
    SIN_ESTADO,
  );
  const activa = actual === "ACTIVE";

  return (
    <form action={accion} className="mt-4 space-y-3">
      <input type="hidden" name="client_id" value={clientaId} />
      <input
        type="hidden"
        name="status"
        value={activa ? "INACTIVE" : "ACTIVE"}
      />
      <ErrorMsg>{estado.error}</ErrorMsg>
      <ExitoMsg>{estado.mensaje}</ExitoMsg>

      <p className="text-sm text-ink/70">
        {activa
          ? "Marcar como inactiva la saca de los listados y de los desplegables al crear casos. Sus casos y su historial siguen intactos."
          : "Esta clienta está inactiva: no aparece en los listados ni se le pueden abrir casos nuevos."}
      </p>

      <SubmitButton
        variante={activa ? "peligro" : "contorno"}
        tamano="sm"
        pendiente="Actualizando..."
      >
        {activa ? "Marcar como inactiva" : "Reactivar"}
      </SubmitButton>
    </form>
  );
}
