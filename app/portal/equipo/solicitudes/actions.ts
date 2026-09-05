"use server";

import { revalidatePath } from "next/cache";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { texto, type EstadoAccion } from "@/lib/acciones/tipos";
import { ESTADOS_LEAD } from "@/lib/db/tipos";

export async function actualizarSolicitudAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  await requireEquipo();

  const id = texto(formData, "id");
  const status = texto(formData, "status");

  if (!id) return { error: "Falta la solicitud." };
  if (!status || !(status in ESTADOS_LEAD)) {
    return { error: "Ese estado no existe." };
  }

  const nota = texto(formData, "internal_note");

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("leads")
    .update({ status, internal_note: nota })
    .eq("id", id);

  if (error) return { error: `No se pudo actualizar: ${error.message}` };

  revalidatePath("/portal/equipo/solicitudes");
  revalidatePath("/portal/equipo");
  return { ok: true, mensaje: "Solicitud actualizada." };
}
