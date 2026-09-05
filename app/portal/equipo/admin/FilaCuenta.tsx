"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ErrorMsg, ExitoMsg } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { ROLES, fechaCorta } from "@/lib/db/tipos";
import { actualizarCuentaAction } from "./actions";

export type Cuenta = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
};

const CONTROL =
  "rounded-xl border border-ink/20 bg-cream px-3 py-2 text-sm text-ink outline-none " +
  "focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-60";

export function FilaCuenta({ cuenta, esYo }: { cuenta: Cuenta; esYo: boolean }) {
  const [estado, accion] = useActionState(actualizarCuentaAction, SIN_ESTADO);

  return (
    <li className="py-4">
      <form action={accion} className="space-y-3">
        <input type="hidden" name="id" value={cuenta.id} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {cuenta.full_name || "(sin nombre)"}
              {esYo && <span className="ml-2 text-xs text-ink/50">— tú</span>}
            </p>
            <p className="truncate text-xs text-ink/60">
              {cuenta.email ?? "(sin correo)"} · desde{" "}
              {fechaCorta(cuenta.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label>
              <span className="sr-only">Rol de {cuenta.email}</span>
              <select
                name="role"
                defaultValue={cuenta.role}
                disabled={esYo}
                className={CONTROL}
              >
                {Object.entries(ROLES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Estado de {cuenta.email}</span>
              <select
                name="status"
                defaultValue={cuenta.status}
                disabled={esYo}
                className={CONTROL}
              >
                <option value="ACTIVE">Activa</option>
                <option value="INACTIVE">Inactiva</option>
              </select>
            </label>

            {esYo ? (
              <Badge>No editable</Badge>
            ) : (
              <SubmitButton variante="contorno" tamano="sm" pendiente="...">
                Guardar
              </SubmitButton>
            )}
          </div>
        </div>

        <ErrorMsg>{estado.error}</ErrorMsg>
        <ExitoMsg>{estado.mensaje}</ExitoMsg>
      </form>
    </li>
  );
}
