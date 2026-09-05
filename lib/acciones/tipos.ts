/**
 * Resultado de una acción de servidor.
 *
 * Antes las acciones lanzaban `throw new Error("...")` cuando algo faltaba.
 * Eso en Next tumba la pantalla entera y muestra el error genérico: la
 * persona pierde todo lo que había escrito y no se entera de cuál campo
 * estaba mal. Devolver el problema en lugar de lanzarlo deja el formulario
 * en pie con sus datos.
 */
export type EstadoAccion = {
  ok?: boolean;
  error?: string;
  mensaje?: string;
};

export const SIN_ESTADO: EstadoAccion = {};

/** Texto limpio de un campo del formulario, o null si venía vacío. */
export function texto(formData: FormData, campo: string): string | null {
  const valor = formData.get(campo);
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : null;
}

/**
 * Comprueba que el valor recibido sea uno de los que la base acepta.
 *
 * Un `<select>` no protege nada: lo que llega al servidor es texto que
 * cualquiera puede cambiar antes de enviarlo. La base tiene sus propias
 * restricciones `check`, pero fallar aquí da un mensaje legible en vez de
 * un error de Postgres en pantalla.
 */
export function unoDe<T extends string>(
  valor: string | null,
  permitidos: Record<T, unknown>,
  porDefecto: T,
): T {
  return valor && valor in permitidos ? (valor as T) : porDefecto;
}
