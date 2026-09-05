import type { Metadata } from "next";
import { getProfile } from "@/lib/auth/get-profile";
import { isStaff } from "@/lib/auth/require-role";
import { ROLES } from "@/lib/db/tipos";
import { PortalNav, type Enlace } from "./PortalNav";

export const metadata: Metadata = {
  // El layout raíz ya añade "| Themia Legal" con su plantilla.
  title: "Portal privado",
  // El portal no tiene nada que hacer en un buscador.
  robots: { index: false, follow: false },
};

const EQUIPO: Enlace[] = [
  { href: "/portal/equipo", label: "Tablero" },
  { href: "/portal/equipo/solicitudes", label: "Solicitudes" },
  { href: "/portal/equipo/casos", label: "Casos" },
  { href: "/portal/equipo/clientes", label: "Clientas" },
];

const ADMIN: Enlace = { href: "/portal/equipo/admin", label: "Equipo" };

const CLIENTE: Enlace[] = [{ href: "/portal/cliente", label: "Mis asuntos" }];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  const enlaces = isStaff(profile.role)
    ? profile.role === "SUPER_ADMIN"
      ? [...EQUIPO, ADMIN]
      : EQUIPO
    : CLIENTE;

  return (
    <div className="min-h-screen bg-cream">
      <PortalNav
        enlaces={enlaces}
        nombre={profile.full_name || profile.email}
        rol={ROLES[profile.role]}
      />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
