"use client";

import { useActionState } from "react";
import { ErrorMsg, ExitoMsg, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { linkClientAccountAction } from "../actions";

export function VincularCuenta({
  clientaId,
  cuentas,
}: {
  clientaId: string;
  cuentas: { id: string; email: string | null; full_name: string | null }[];
}) {
  const [estado, accion] = useActionState(linkClientAccountAction, SIN_ESTADO);

  if (cuentas.length === 0) {
    return (
      <p className="mt-4 text-sm text-ink/60">
        No hay cuentas de acceso libres. La clienta tiene que registrarse
        primero desde el portal; su cuenta aparecerá aquí para vincularla.
      </p>
    );
  }

  return (
    <form action={accion} className="mt-4 space-y-3">
      <input type="hidden" name="client_id" value={clientaId} />
      <ErrorMsg>{estado.error}</ErrorMsg>
      <ExitoMsg>{estado.mensaje}</ExitoMsg>

      <Select
        name="user_id"
        label="Cuenta de acceso"
        required
        vacio="Elige una cuenta..."
        defaultValue=""
        opciones={cuentas.map((c) => ({
          value: c.id,
          label: c.email ?? c.full_name ?? c.id,
        }))}
      />

      <p className="text-xs text-ink/55">
        Al vincularla, esa persona verá este expediente desde su portal.
        Revisa el correo antes de guardar.
      </p>

      <SubmitButton variante="contorno" tamano="sm" pendiente="Vinculando...">
        Vincular cuenta
      </SubmitButton>
    </form>
  );
}
