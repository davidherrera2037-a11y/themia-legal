import { redirect } from "next/navigation";
import { getProfile, type Profile, type Role } from "./get-profile";

const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"];

export function isStaff(role: Role) {
  return STAFF_ROLES.includes(role);
}

/**
 * Exige que la persona tenga uno de los roles permitidos para ver esta
 * pantalla. Si no cumple, la manda de vuelta a SU área correcta (no a
 * un error genérico) — así nadie "descubre" por accidente rutas que no
 * le corresponden.
 *
 * Esto es la capa de UX. La capa real de seguridad sigue siendo RLS en
 * la base de datos — esto solo evita que alguien vea una pantalla que
 * de todas formas no le devolvería datos.
 */
export async function requireRole(allowed: Role[]): Promise<Profile> {
  const profile = await getProfile();

  if (!allowed.includes(profile.role)) {
    redirect(isStaff(profile.role) ? "/portal/equipo" : "/portal/cliente");
  }

  return profile;
}
