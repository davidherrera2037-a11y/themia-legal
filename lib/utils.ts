import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Une clases de Tailwind resolviendo los conflictos.
 *
 * Sin esto, `cn("px-4", "px-6")` deja las dos y gana la que Tailwind haya
 * puesto después en la hoja, que no es necesariamente la que uno quería.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
