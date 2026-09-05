import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { inicioDe } from "@/lib/auth/require-role";

/**
 * /portal no es una pantalla: es el reparto. Cada quien acaba en su área
 * según el rol, así que un mismo enlace sirve para todo el mundo.
 */
export default async function PortalRoot() {
  const profile = await getProfile();
  redirect(inicioDe(profile.role));
}
