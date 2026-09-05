"use client";

import { useActionState } from "react";
import { ErrorMsg, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { TIPOS_DOCUMENTO, opciones } from "@/lib/db/tipos";
import { actualizarClientaAction, createClientAction } from "../actions";

export type ValoresClienta = {
  id?: string;
  full_name?: string;
  identification_type?: string;
  identification_number?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
};

/**
 * El mismo formulario para crear y para corregir.
 *
 * Al crear puede llegar medio relleno desde una solicitud del sitio; al
 * corregir llega con `id` y cambia la acción. No incluye el estado ni la
 * cuenta vinculada: cada uno tiene su propio control y sus permisos.
 */
export function FormularioClienta({
  valoresIniciales,
}: {
  valoresIniciales?: ValoresClienta;
}) {
  const editando = Boolean(valoresIniciales?.id);
  const [estado, accion] = useActionState(
    editando ? actualizarClientaAction : createClientAction,
    SIN_ESTADO,
  );

  return (
    <form action={accion} className="mt-6 space-y-4">
      <ErrorMsg>{estado.error}</ErrorMsg>
      {editando && <input type="hidden" name="id" value={valoresIniciales?.id} />}

      <Input
        name="full_name"
        label="Nombre completo"
        required
        maxLength={120}
        defaultValue={valoresIniciales?.full_name}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          name="identification_type"
          label="Tipo de documento"
          defaultValue={valoresIniciales?.identification_type ?? "CC"}
          opciones={opciones(TIPOS_DOCUMENTO)}
        />
        <Input
          name="identification_number"
          label="Número de documento"
          required
          inputMode="numeric"
          maxLength={40}
          defaultValue={valoresIniciales?.identification_number}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="phone"
          label="Teléfono"
          type="tel"
          maxLength={40}
          defaultValue={valoresIniciales?.phone ?? ""}
        />
        <Input
          name="email"
          label="Correo"
          type="email"
          maxLength={160}
          defaultValue={valoresIniciales?.email ?? ""}
        />
      </div>

      <Input
        name="address"
        label="Dirección"
        maxLength={200}
        defaultValue={valoresIniciales?.address ?? ""}
      />
      <Input
        name="city"
        label="Ciudad"
        maxLength={80}
        defaultValue={valoresIniciales?.city ?? ""}
      />

      <SubmitButton className="w-full" pendiente="Guardando...">
        {editando ? "Guardar cambios" : "Guardar clienta"}
      </SubmitButton>
    </form>
  );
}
