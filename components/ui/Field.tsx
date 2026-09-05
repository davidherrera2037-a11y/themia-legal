import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Campos de formulario.
 *
 * La cadena de clases de un input aparecía copiada tal cual catorce veces
 * en el portal. Cambiar el color del foco significaba catorce ediciones y
 * una probabilidad alta de dejar una atrás. Aquí está una vez.
 *
 * Cada campo genera su propio `id` a partir del `name` y lo ata a la
 * etiqueta: sin eso, un lector de pantalla lee "cuadro de texto" sin decir
 * de qué, y pulsar la etiqueta no enfoca el campo.
 */

const CONTROL =
  "w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink placeholder:text-ink/40 " +
  "outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

function Etiqueta({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {hint && <span className="ml-1 font-normal text-ink/50">{hint}</span>}
    </label>
  );
}

type Comun = { label: ReactNode; hint?: ReactNode; name: string };

export function Input({
  label,
  hint,
  name,
  className,
  ...props
}: Comun & ComponentProps<"input">) {
  return (
    <div>
      <Etiqueta htmlFor={name} hint={hint}>
        {label}
      </Etiqueta>
      <input id={name} name={name} className={cn(CONTROL, className)} {...props} />
    </div>
  );
}

export function Textarea({
  label,
  hint,
  name,
  className,
  ...props
}: Comun & ComponentProps<"textarea">) {
  return (
    <div>
      <Etiqueta htmlFor={name} hint={hint}>
        {label}
      </Etiqueta>
      <textarea
        id={name}
        name={name}
        className={cn(CONTROL, "resize-none", className)}
        {...props}
      />
    </div>
  );
}

export function Select({
  label,
  hint,
  name,
  opciones,
  vacio,
  className,
  ...props
}: Comun &
  ComponentProps<"select"> & {
    opciones: readonly { value: string; label: string }[];
    /** Texto de la primera opción sin valor, cuando el campo es opcional. */
    vacio?: string;
  }) {
  return (
    <div>
      <Etiqueta htmlFor={name} hint={hint}>
        {label}
      </Etiqueta>
      <select id={name} name={name} className={cn(CONTROL, className)} {...props}>
        {vacio !== undefined && <option value="">{vacio}</option>}
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * El mensaje de error de un formulario.
 *
 * `role="alert"` hace que el lector de pantalla lo anuncie en cuanto
 * aparece; sin eso, quien no ve la pantalla pulsa "Guardar", no pasa nada
 * aparente y no tiene forma de enterarse de por qué.
 */
export function ErrorMsg({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-800/25 bg-red-50 px-4 py-2.5 text-sm text-red-900"
    >
      {children}
    </p>
  );
}

export function ExitoMsg({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="status"
      className="rounded-xl border border-emerald-800/25 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900"
    >
      {children}
    </p>
  );
}
