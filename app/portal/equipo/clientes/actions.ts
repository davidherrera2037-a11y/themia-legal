"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEquipo, requireRole } from "@/lib/auth/require-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { texto, unoDe, type EstadoAccion } from "@/lib/acciones/tipos";
import { TIPOS_DOCUMENTO } from "@/lib/db/tipos";

export async function createClientAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  await requireEquipo();

  const full_name = texto(formData, "full_name");
  const identification_number = texto(formData, "identification_number");

  if (!full_name) return { error: "El nombre completo es obligatorio." };
  if (!identification_number) {
    return { error: "El número de documento es obligatorio." };
  }

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      full_name,
      identification_type: unoDe(
        texto(formData, "identification_type"),
        TIPOS_DOCUMENTO,
        "CC",
      ),
      identification_number,
      phone: texto(formData, "phone"),
      email: texto(formData, "email"),
      address: texto(formData, "address"),
      city: texto(formData, "city"),
    })
    .select("id")
    .single();

  if (error) {
    // 23505 es la violación del índice único de documento. El mensaje de
    // Postgres es correcto pero ilegible; este dice qué hacer.
    if (error.code === "23505") {
      return {
        error:
          "Ya existe una clienta con ese documento. Búscala en el listado en vez de crearla otra vez.",
      };
    }
    return { error: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/portal/equipo/clientes");
  redirect(`/portal/equipo/clientes/${data.id}`);
}

export async function linkClientAccountAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  // Vincular una cuenta con una clienta decide quién puede leer ese
  // expediente desde fuera del despacho. No es una tarea de todos los días
  // y se deja en manos de quien administra.
  await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA"]);

  const client_id = texto(formData, "client_id");
  const user_id = texto(formData, "user_id");

  if (!client_id) return { error: "Falta la clienta." };
  if (!user_id) return { error: "Elige la cuenta a vincular." };

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update({ user_id })
    .eq("id", client_id);

  if (error) return { error: `No se pudo vincular: ${error.message}` };

  revalidatePath("/portal/equipo/clientes");
  revalidatePath(`/portal/equipo/clientes/${client_id}`);
  return { ok: true, mensaje: "Cuenta vinculada." };
}

export async function actualizarEstadoClientaAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  await requireEquipo();

  const client_id = texto(formData, "client_id");
  const status = texto(formData, "status");

  if (!client_id) return { error: "Falta la clienta." };
  if (status !== "ACTIVE" && status !== "INACTIVE") {
    return { error: "Ese estado no existe." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update({ status })
    .eq("id", client_id);

  if (error) return { error: `No se pudo actualizar: ${error.message}` };

  revalidatePath("/portal/equipo/clientes");
  revalidatePath(`/portal/equipo/clientes/${client_id}`);
  return { ok: true, mensaje: "Estado actualizado." };
}
