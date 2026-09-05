import type { ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variante = "primario" | "contorno" | "fantasma" | "peligro";
type Tamano = "sm" | "md";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-ink text-cream hover:bg-ink-deep",
  contorno: "border border-ink/20 text-ink hover:bg-ink hover:text-cream",
  fantasma: "text-ink/70 hover:bg-ink/5 hover:text-ink",
  peligro: "border border-red-800/30 text-red-800 hover:bg-red-800 hover:text-cream",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

function clases(variante: Variante, tamano: Tamano, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTES[variante],
    TAMANOS[tamano],
    className,
  );
}

type BotonProps = ComponentProps<"button"> & {
  variante?: Variante;
  tamano?: Tamano;
};

export function Button({
  variante = "primario",
  tamano = "md",
  className,
  ...props
}: BotonProps) {
  return <button className={clases(variante, tamano, className)} {...props} />;
}

type EnlaceProps = ComponentProps<typeof Link> & {
  variante?: Variante;
  tamano?: Tamano;
};

/** Mismo aspecto que el botón, pero navega. Un enlace debe ser un enlace. */
export function ButtonLink({
  variante = "primario",
  tamano = "md",
  className,
  ...props
}: EnlaceProps) {
  return <Link className={clases(variante, tamano, className)} {...props} />;
}
