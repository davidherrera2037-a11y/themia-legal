"use client";

import { useActionState } from "react";
import { Input, Select, Textarea, ErrorMsg } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { AREAS, PRIORIDADES, TIPOS_CASO, opciones } from "@/lib/db/tipos";
import { actualizarCasoAction, createCaseAction } from "../actions";

export type ValoresCaso = {
  id?: string;
  client_id?: string;
  responsible_lawyer_id?: string | null;
  area?: string;
  case_type?: string;
  title?: string;
  description?: string | null;
  client_objective?: string | null;
  priority?: string;
};

/**
 * El mismo formulario para crear y para corregir.
 *
 * Cuando llega `valores.id` está editando: cambia la acción, y la clienta
 * y la abogada dejan de poder tocarse aquí. Mover un caso a otra clienta
 * cambiaría quién puede leerlo desde fuera del despacho, y la abogada
 * responsable tiene su propio control en el expediente.
 */
export function FormularioCaso({
  clientes,
  abogadas,
  clientePreseleccionado,
  valores,
}: {
  clientes: { id: string; full_name: string }[];
  abogadas: { id: string; full_name: string | null }[];
  clientePreseleccionado?: string;
  valores?: ValoresCaso;
}) {
  const editando = Boolean(valores?.id);
  const [estado, accion] = useActionState(
    editando ? actualizarCasoAction : createCaseAction,
    SIN_ESTADO,
  );

  return (
    <form action={accion} className="mt-6 space-y-4">
      <ErrorMsg>{estado.error}</ErrorMsg>
      {editando && <input type="hidden" name="id" value={valores?.id} />}

      {!editando && (
        <>
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
        </>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          name="area"
          label="Área"
          required
          defaultValue={valores?.area}
          opciones={opciones(AREAS)}
        />
        <Select
          name="case_type"
          label="Tipo de asunto"
          defaultValue={valores?.case_type ?? "CONSULTA"}
          opciones={opciones(TIPOS_CASO)}
        />
      </div>

      <Input
        name="title"
        label="Título del caso"
        required
        maxLength={200}
        defaultValue={valores?.title}
        placeholder="Ej: Regulación de visitas"
      />

      <Textarea
        name="description"
        label="Descripción"
        hint="(lenguaje técnico, interno)"
        rows={3}
        maxLength={5000}
        defaultValue={valores?.description ?? ""}
      />

      <Textarea
        name="client_objective"
        label="Objetivo de la clienta"
        hint="(en sus propias palabras)"
        rows={2}
        maxLength={2000}
        defaultValue={valores?.client_objective ?? ""}
        placeholder="Qué espera lograr con este caso"
      />

      <Select
        name="priority"
        label="Prioridad"
        defaultValue={valores?.priority ?? "MEDIA"}
        opciones={opciones(PRIORIDADES)}
      />

      <SubmitButton className="w-full" pendiente="Guardando...">
        {editando ? "Guardar cambios" : "Guardar caso"}
      </SubmitButton>
    </form>
  );
}
