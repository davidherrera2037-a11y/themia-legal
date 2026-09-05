import { redirect } from "next/navigation";
import { getProfile, type Profile } from "./get-profile";
import { ROLES_EQUIPO, type Role } from "@/lib/db/tipos";

export function isStaff(role: Role): boolean {
  return (ROLES_EQUIPO as readonly Role[]).includes(role);
}

/** A dónde pertenece cada quien cuando entra al portal. */
export function inicioDe(role: Role): string {
  return isStaff(role) ? "/portal/equipo" : "/portal/cliente";
}

/**
 * Exige que la persona tenga uno de los roles permitidos para ver esta
 * pantalla. Si no cumple, la manda de vuelta a SU área correcta (no a un
 * error genérico) — así nadie "descubre" por accidente rutas que no le
 * corresponden.
 *
 * Esto es la capa de UX. La capa real de seguridad sigue siendo RLS en la
 * base de datos — esto solo evita que alguien vea una pantalla que de
 * todas formas no le devolvería datos.
 */
export async function requireRole(allowed: readonly Role[]): Promise<Profile> {
  const profile = await getProfile();

  if (!allowed.includes(profile.role)) {
    redirect(inicioDe(profile.role));
  }

  return profile;
}

/** Atajo para las pantallas del equipo, que son casi todas. */
export function requireEquipo(): Promise<Profile> {
  return requireRole(ROLES_EQUIPO);
}
