import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tono = "neutro" | "aviso" | "alerta" | "exito" | "oro";

const TONOS: Record<Tono, string> = {
  neutro: "bg-ink/10 text-ink/70",
  oro: "bg-gold-pale text-ink/75",
  aviso: "bg-amber-100 text-amber-900",
  alerta: "bg-red-100 text-red-900",
  exito: "bg-emerald-100 text-emerald-900",
};

export function Badge({
  children,
  tono = "neutro",
  className,
}: {
  children: ReactNode;
  tono?: Tono;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
