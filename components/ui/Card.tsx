import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink/10 bg-cream-soft p-6 sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-display text-lg font-semibold text-ink">{children}</h2>
      {hint && <span className="text-xs text-ink/50">{hint}</span>}
    </div>
  );
}

/** Lo que se muestra cuando una lista está vacía. */
export function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-ink/20 px-4 py-6 text-center text-sm text-ink/60">
      {children}
    </p>
  );
}
