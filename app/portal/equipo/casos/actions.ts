"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { texto, unoDe, type EstadoAccion } from "@/lib/acciones/tipos";
import {
  AREAS,
  ESTADOS_CASO,
  PRIORIDADES,
  TIPOS_CASO,
  TIPOS_EVENTO,
  type EstadoCaso,
} from "@/lib/db/tipos";

export async function createCaseAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  await requireEquipo();

  const client_id = texto(formData, "client_id");
  const title = texto(formData, "title");

  if (!client_id) return { error: "Elige la clienta del caso." };
  if (!title) return { error: "El caso necesita un título." };
  if (title.length > 200) {
    return { error: "El título es demasiado largo (máximo 200 caracteres)." };
  }

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("cases")
    .insert({
      client_id,
      responsible_lawyer_id: texto(formData, "responsible_lawyer_id"),
      area: unoDe(texto(formData, "area"), AREAS, "FAMILIA"),
      case_type: unoDe(texto(formData, "case_type"), TIPOS_CASO, "CONSULTA"),
      title,
      description: texto(formData, "description"),
      client_objective: texto(formData, "client_objective"),
      priority: unoDe(texto(formData, "priority"), PRIORIDADES, "MEDIA"),
    })
    .select("id")
    .single();

  if (error) {
    return { error: `No se pudo guardar el caso: ${error.message}` };
  }

  revalidatePath("/portal/equipo/casos");
  revalidatePath("/portal/equipo");
  // El redirect va fuera del try de Supabase a propósito: Next lo señala
  // lanzando una excepción interna, y atraparla convertiría una navegación
  // correcta en un "error al guardar".
  redirect(`/portal/equipo/casos/${data.id}`);
}

export async function cambiarEstadoAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  await requireEquipo();

  const case_id = texto(formData, "case_id");
  const status = texto(formData, "status");

  if (!case_id) return { error: "Falta el caso." };
  if (!status || !(status in ESTADOS_CASO)) {
    return { error: "Ese estado no existe." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("cases")
    .update({ status: status as EstadoCaso })
    .eq("id", case_id);

  if (error) return { error: `No se pudo mover el caso: ${error.message}` };

  // La actuación de "cambio de estado" no se escribe aquí: la pone un
  // trigger en la base. Así queda registrada también cuando el estado se
  // cambia desde la consola de Supabase, que es justo cuando más falta
  // hace saberlo.
  revalidatePath(`/portal/equipo/casos/${case_id}`);
  revalidatePath("/portal/equipo/casos");
  revalidatePath("/portal/equipo");
  return { ok: true, mensaje: "Estado actualizado." };
}

export async function agregarActuacionAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const profile = await requireEquipo();

  const case_id = texto(formData, "case_id");
  const title = texto(formData, "title");

  if (!case_id) return { error: "Falta el caso." };
  if (!title) return { error: "Escribe de qué se trata la actuación." };
  if (title.length > 200) {
    return { error: "El resumen es demasiado largo (máximo 200 caracteres)." };
  }

  const detail = texto(formData, "detail");
  if (detail && detail.length > 5000) {
    return { error: "El detalle es demasiado largo (máximo 5000 caracteres)." };
  }

  // Una fecha vacía o mal escrita no debe convertirse en "1970".
  const fechaCruda = texto(formData, "occurred_at");
  const fecha = fechaCruda ? new Date(fechaCruda) : new Date();
  if (Number.isNaN(fecha.getTime())) {
    return { error: "La fecha de la actuación no es válida." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("case_events").insert({
    case_id,
    author_id: profile.id,
    author_name: profile.full_name ?? profile.email,
    kind: unoDe(texto(formData, "kind"), TIPOS_EVENTO, "NOTA"),
    title,
    detail,
    occurred_at: fecha.toISOString(),
    // Por defecto, privado. Compartir con la clienta tiene que ser una
    // decisión consciente, no lo que pasa si a alguien se le olvida
    // desmarcar una casilla.
    visible_para_cliente: formData.get("visible_para_cliente") === "on",
  });

  if (error) {
    return { error: `No se pudo guardar la actuación: ${error.message}` };
  }

  revalidatePath(`/portal/equipo/casos/${case_id}`);
  return { ok: true, mensaje: "Actuación registrada." };
}

export async function asignarAbogadaAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  await requireEquipo();

  const case_id = texto(formData, "case_id");
  if (!case_id) return { error: "Falta el caso." };

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("cases")
    .update({ responsible_lawyer_id: texto(formData, "responsible_lawyer_id") })
    .eq("id", case_id);

  if (error) return { error: `No se pudo asignar: ${error.message}` };

  revalidatePath(`/portal/equipo/casos/${case_id}`);
  return { ok: true, mensaje: "Responsable actualizada." };
}
