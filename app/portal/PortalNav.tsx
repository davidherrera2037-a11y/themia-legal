"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

export type Enlace = { href: string; label: string };

/**
 * Barra del portal.
 *
 * Antes cada pantalla dibujaba su propio encabezado y su propio botón de
 * salir, y "volver" era un enlace de texto distinto en cada sitio. Con una
 * sola barra siempre presente, moverse deja de depender del botón atrás
 * del navegador.
 */
export function PortalNav({
  enlaces,
  nombre,
  rol,
}: {
  enlaces: Enlace[];
  nombre: string;
  rol: string;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  // /portal/equipo/casos/xxx debe marcar "Casos", pero /portal/equipo no
  // debe marcarse a la vez: el inicio solo coincide de forma exacta.
  const activo = (href: string) =>
    pathname === href ||
    (href.split("/").length > 3 && pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/portal" className="flex shrink-0 items-center gap-2.5">
          <LogoMark className="h-8 text-gold" />
          <span className="font-display text-base font-semibold tracking-wide text-ink">
            THEMIA
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              aria-current={activo(e.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                activo(e.href)
                  ? "bg-ink text-cream"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink",
              )}
            >
              {e.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-right text-xs leading-tight text-ink/60">
            <span className="block font-medium text-ink">{nombre}</span>
            {rol}
          </span>
          <LogoutButton />
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink md:hidden"
        >
          {abierto ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {abierto && (
        <div className="border-t border-ink/10 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setAbierto(false)}
                aria-current={activo(e.href) ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3.5 py-2 text-sm",
                  activo(e.href)
                    ? "bg-ink text-cream"
                    : "text-ink/75 hover:bg-ink/5",
                )}
              >
                {e.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="text-xs leading-tight text-ink/60">
              <span className="block font-medium text-ink">{nombre}</span>
              {rol}
            </span>
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  );
}
