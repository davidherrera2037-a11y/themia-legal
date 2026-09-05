"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { Button } from "./Button";

/**
 * Botón de envío que se deshabilita solo mientras la acción corre.
 *
 * Sin esto, pulsar dos veces "Guardar caso" crea el caso dos veces — y en
 * una conexión lenta pulsar dos veces es lo normal, porque nada indica que
 * la primera vez sirvió de algo.
 */
export function SubmitButton({
  children,
  pendiente,
  ...props
}: ComponentProps<typeof Button> & { pendiente?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (pendiente ?? "Guardando...") : children}
    </Button>
  );
}
