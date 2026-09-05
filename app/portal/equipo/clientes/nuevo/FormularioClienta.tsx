"use client";

import { useActionState } from "react";
import { ErrorMsg, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { TIPOS_DOCUMENTO, opciones } from "@/lib/db/tipos";
import { createClientAction } from "../actions";

export function FormularioClienta({
  valoresIniciales,
}: {
  valoresIniciales?: { full_name?: string; phone?: string; email?: string };
}) {
  const [estado, accion] = useActionState(createClientAction, SIN_ESTADO);

  return (
    <form action={accion} className="mt-6 space-y-4">
      <ErrorMsg>{estado.error}</ErrorMsg>

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
          defaultValue="CC"
          opciones={opciones(TIPOS_DOCUMENTO)}
        />
        <Input
          name="identification_number"
          label="Número de documento"
          required
          inputMode="numeric"
          maxLength={40}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          name="phone"
          label="Teléfono"
          type="tel"
          maxLength={40}
          defaultValue={valoresIniciales?.phone}
        />
        <Input
          name="email"
          label="Correo"
          type="email"
          maxLength={160}
          defaultValue={valoresIniciales?.email}
        />
      </div>

      <Input name="address" label="Dirección" maxLength={200} />
      <Input name="city" label="Ciudad" maxLength={80} />

      <SubmitButton className="w-full" pendiente="Guardando...">
        Guardar clienta
      </SubmitButton>
    </form>
  );
}
