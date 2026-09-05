"use client";

import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Lock } from "lucide-react";
import { LogoMark } from "./Logo";

const PRACTICE_LINKS = [
  { label: "Derecho de familia", href: "#familia" },
  { label: "Derecho civil", href: "#civil" },
  { label: "Derecho laboral", href: "#laboral" },
  { label: "Derecho comercial y empresarial", href: "#comercial-empresarial" },
  { label: "Derecho constitucional", href: "#constitucional" },
  { label: "Derecho penal", href: "#penal" },
  { label: "Servicios jurídicos", href: "#servicios-juridicos" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Subtle shadow/solid background once the page has scrolled a bit
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc closes whichever menu is open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAreasOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock background scroll while the mobile panel is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-ink/10 bg-cream/92 shadow-[0_1px_20px_-12px_rgba(34,26,22,0.4)] backdrop-blur-md"
          : "border-transparent bg-cream/70 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-10">
        <a href="#inicio" className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-auto text-gold" />
          <span className="font-display text-lg font-semibold tracking-[0.08em] text-ink">
            THEMIA LEGAL
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          <a
            href="#inicio"
            className="group relative text-sm font-medium text-ink/85 transition-colors hover:text-ink"
          >
            Inicio
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
          </a>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAreasOpen((v) => !v)}
              aria-expanded={areasOpen}
              aria-controls="areas-dropdown"
              className="flex items-center gap-1 text-sm font-medium text-ink/85 transition-colors hover:text-ink"
            >
              Áreas de práctica
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  areasOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {areasOpen && (
              <>
                {/* Invisible layer that closes the dropdown on outside click */}
                <button
                  type="button"
                  aria-label="Cerrar menú de áreas de práctica"
                  onClick={() => setAreasOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div
                  id="areas-dropdown"
                  className="absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2 rounded-2xl border border-gold/25 bg-cream p-2 shadow-[var(--shadow-alzada)]"
                >
                  {PRACTICE_LINKS.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setAreasOpen(false)}
                      className="block rounded-xl px-4 py-2.5 text-sm text-ink/85 transition-colors hover:bg-gold-pale/60 hover:text-ink"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          <a
            href="#por-que-elegirnos"
            className="group relative text-sm font-medium text-ink/85 transition-colors hover:text-ink"
          >
            ¿Por qué elegirnos?
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
          </a>

          <a
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-ink/85 transition-colors hover:text-ink"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Portal privado
          </a>

          <a
            href="#agenda"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream shadow-[var(--shadow-suave)] transition-all hover:bg-ink-deep hover:shadow-[var(--shadow-alzada)]"
          >
            Agenda tu consulta
          </a>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile full-screen panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-cream lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <a
              href="#inicio"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5"
            >
              <LogoMark className="h-9 w-auto text-gold" />
              <span className="font-display text-lg font-semibold tracking-wide text-ink">
                THEMIA LEGAL
              </span>
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-col items-center gap-6 px-6 pb-16 pt-8">
            <a
              href="#inicio"
              onClick={() => setMobileOpen(false)}
              className="font-display text-2xl text-ink"
            >
              Inicio
            </a>

            <div className="w-full max-w-xs border-t border-ink/10 pt-6 text-center">
              <p className="rotulo text-ink/50">Áreas de práctica</p>
              <div className="mt-4 flex flex-col items-center gap-4">
                {PRACTICE_LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base text-ink/80"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <a
              href="#por-que-elegirnos"
              onClick={() => setMobileOpen(false)}
              className="border-t border-ink/10 pt-6 font-display text-2xl text-ink"
            >
              ¿Por qué elegirnos?
            </a>

            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-base text-ink/80"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Portal privado
            </a>

            <a
              href="#agenda"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream"
            >
              Agenda tu consulta
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
