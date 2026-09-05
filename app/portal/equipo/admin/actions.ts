"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { texto, type EstadoAccion } from "@/lib/acciones/tipos";
import { ROLES } from "@/lib/db/tipos";

/**
 * Cambia el rol o el estado de una cuenta.
 *
 * Esta comprobación de rol es la capa de UX. La de verdad está en la base:
 * la política `profiles_update_super_admin` y el trigger
 * `proteger_rol_y_estado`, que además impide que alguien se cambie el rol a
 * sí mismo aunque llame a la API directamente sin pasar por esta pantalla.
 */
export async function actualizarCuentaAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const yo = await requireRole(["SUPER_ADMIN"]);

  const id = texto(formData, "id");
  const role = texto(formData, "role");
  const status = texto(formData, "status");

  if (!id) return { error: "Falta la cuenta." };
  if (!role || !(role in ROLES)) return { error: "Ese rol no existe." };
  if (status !== "ACTIVE" && status !== "INACTIVE") {
    return { error: "Ese estado no existe." };
  }
  if (id === yo.id) {
    return {
      error:
        "No puedes cambiar tu propio rol ni desactivarte. Pídeselo a otra socia administradora.",
    };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, status })
    .eq("id", id);

  if (error) return { error: `No se pudo actualizar: ${error.message}` };

  revalidatePath("/portal/equipo/admin");
  return { ok: true, mensaje: "Cuenta actualizada." };
}
