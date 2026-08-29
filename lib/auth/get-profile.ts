import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "SUPER_ADMIN" | "ADMINISTRATIVA" | "ABOGADA" | "CLIENTE";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
};

/**
 * Obtiene el usuario autenticado y su perfil (rol incluido).
 * Si no hay sesión, manda a /login.
 *
 * Punto único de verdad: cualquier pantalla o acción que necesite saber
 * quién es la persona y qué rol tiene, pasa por aquí — no se repite
 * esta consulta a mano en cada archivo.
 */
export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profile?.full_name ?? null,
    role: (profile?.role as Role) ?? "CLIENTE",
  };
}
