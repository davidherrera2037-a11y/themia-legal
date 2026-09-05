"use client";

import { useActionState } from "react";
import { Input, Select, Textarea, ErrorMsg } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { AREAS, PRIORIDADES, TIPOS_CASO, opciones } from "@/lib/db/tipos";
import { createCaseAction } from "../actions";

export function FormularioCaso({
  clientes,
  abogadas,
  clientePreseleccionado,
}: {
  clientes: { id: string; full_name: string }[];
  abogadas: { id: string; full_name: string | null }[];
  clientePreseleccionado?: string;
}) {
  const [estado, accion] = useActionState(createCaseAction, SIN_ESTADO);

  return (
    <form action={accion} className="mt-6 space-y-4">
      <ErrorMsg>{estado.error}</ErrorMsg>

      <Select
        name="client_id"
        label="Clienta"
        required
        defaultValue={clientePreseleccionado}
        opciones={clientes.map((c) => ({ value: c.id, label: c.full_name }))}
      />

      <Select
        name="responsible_lawyer_id"
        label="Abogada responsable"
        hint="(se puede asignar después)"
        vacio="Sin asignar todavía"
        defaultValue=""
        opciones={abogadas.map((a) => ({
          value: a.id,
          label: a.full_name || "(sin nombre)",
        }))}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select name="area" label="Área" required opciones={opciones(AREAS)} />
        <Select
          name="case_type"
          label="Tipo de asunto"
          defaultValue="CONSULTA"
          opciones={opciones(TIPOS_CASO)}
        />
      </div>

      <Input
        name="title"
        label="Título del caso"
        required
        maxLength={200}
        placeholder="Ej: Regulación de visitas"
      />

      <Textarea
        name="description"
        label="Descripción"
        hint="(lenguaje técnico, interno)"
        rows={3}
        maxLength={5000}
      />

      <Textarea
        name="client_objective"
        label="Objetivo de la clienta"
        hint="(en sus propias palabras)"
        rows={2}
        maxLength={2000}
        placeholder="Qué espera lograr con este caso"
      />

      <Select
        name="priority"
        label="Prioridad"
        defaultValue="MEDIA"
        opciones={opciones(PRIORIDADES)}
      />

      <SubmitButton className="w-full" pendiente="Guardando caso...">
        Guardar caso
      </SubmitButton>
    </form>
  );
}
