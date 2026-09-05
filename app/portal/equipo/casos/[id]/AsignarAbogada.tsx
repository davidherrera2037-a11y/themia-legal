"use client";

import { useActionState } from "react";
import { ErrorMsg, ExitoMsg, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { asignarAbogadaAction } from "../actions";

export function AsignarAbogada({
  casoId,
  actual,
  abogadas,
}: {
  casoId: string;
  actual: string | null;
  abogadas: { id: string; full_name: string | null }[];
}) {
  const [estado, accion] = useActionState(asignarAbogadaAction, SIN_ESTADO);

  return (
    <form action={accion} className="mt-4 space-y-3">
      <input type="hidden" name="case_id" value={casoId} />
      <ErrorMsg>{estado.error}</ErrorMsg>
      <ExitoMsg>{estado.mensaje}</ExitoMsg>

      <Select
        name="responsible_lawyer_id"
        label="Abogada a cargo"
        defaultValue={actual ?? ""}
        vacio="Sin asignar"
        opciones={abogadas.map((a) => ({
          value: a.id,
          label: a.full_name || "(sin nombre)",
        }))}
      />

      <SubmitButton variante="contorno" tamano="sm" pendiente="Asignando...">
        Guardar
      </SubmitButton>
    </form>
  );
}
