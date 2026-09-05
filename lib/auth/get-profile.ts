import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/db/tipos";

export type { Role };

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
};

/**
 * Obtiene el usuario autenticado y su perfil (rol incluido).
 * Si no hay sesión, manda a /login.
 *
 * Punto único de verdad: cualquier pantalla o acción que necesite saber
 * quién es la persona y qué rol tiene, pasa por aquí — no se repite esta
 * consulta a mano en cada archivo.
 *
 * Va envuelto en `cache` de React: el layout del portal y la pantalla que
 * hay dentro necesitan lo mismo, y sin esto serían dos viajes a la base en
 * cada carga. `cache` los une en uno solo por petición.
 */
export const getProfile = cache(async function getProfile(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, status")
    .eq("id", user.id)
    .single();

  // Una cuenta desactivada conserva su sesión hasta que venza. Sin esta
  // comprobación, dar de baja a alguien en la base no lo saca del portal
  // hasta días después.
  if (profile?.status === "INACTIVE") {
    redirect("/login?motivo=inactiva");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profile?.full_name ?? null,
    // Si por lo que sea no hay fila de perfil, el rol más bajo es el que
    // menos daño hace. Nunca al revés.
    role: (profile?.role as Role) ?? "CLIENTE",
    status: (profile?.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE",
  };
});
