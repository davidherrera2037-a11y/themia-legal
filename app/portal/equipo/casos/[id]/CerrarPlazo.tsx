"use client";

import { useActionState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { cerrarPlazoAction } from "../plazos-actions";

/**
 * Los botones de cerrar o reabrir un plazo.
 *
 * Van sin confirmación a propósito: cerrar un plazo por error se deshace
 * con el botón de al lado, y pedir confirmación en algo que se hace veinte
 * veces al día acaba en que nadie lo lee.
 */
export function CerrarPlazo({
  id,
  pendiente,
}: {
  id: string;
  pendiente: boolean;
}) {
  const [estado, accion] = useActionState(cerrarPlazoAction, SIN_ESTADO);

  const boton =
    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors disabled:opacity-50";

  return (
    <form action={accion} className="flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      {estado.error && <span className="sr-only" role="alert">{estado.error}</span>}

      {pendiente ? (
        <>
          <button
            type="submit"
            name="status"
            value="CUMPLIDO"
            title="Marcar como cumplido"
            aria-label="Marcar como cumplido"
            className={`${boton} border-emerald-800/25 text-emerald-800 hover:bg-emerald-800 hover:text-cream`}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="submit"
            name="status"
            value="CANCELADO"
            title="Cancelar el plazo"
            aria-label="Cancelar el plazo"
            className={`${boton} border-ink/20 text-ink/60 hover:bg-ink hover:text-cream`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      ) : (
        <button
          type="submit"
          name="status"
          value="PENDIENTE"
          title="Reabrir el plazo"
          aria-label="Reabrir el plazo"
          className={`${boton} border-ink/20 text-ink/60 hover:bg-ink hover:text-cream`}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
