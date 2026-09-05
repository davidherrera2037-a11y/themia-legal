"use server";

import { revalidatePath } from "next/cache";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { texto, unoDe, type EstadoAccion } from "@/lib/acciones/tipos";
import { TIPOS_PLAZO } from "@/lib/db/tipos";
import {
  aISO,
  desdeISO,
  esHabil,
  hoyEnColombia,
  sumarHabiles,
} from "@/lib/legal/festivos";

export async function crearPlazoAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const profile = await requireEquipo();

  const case_id = texto(formData, "case_id");
  const title = texto(formData, "title");

  if (!case_id) return { error: "Falta el caso." };
  if (!title) return { error: "Escribe qué es lo que vence." };
  if (title.length > 200) {
    return { error: "El título es demasiado largo (máximo 200 caracteres)." };
  }

  const kind = unoDe(texto(formData, "kind"), TIPOS_PLAZO, "TERMINO");
  const modo = texto(formData, "modo"); // "habiles" | "fecha"

  let due_date: string;
  let base_date: string | null = null;
  let business_days: number | null = null;

  if (modo === "habiles") {
    // El término se cuenta: se pide desde cuándo y cuántos días hábiles.
    const desdeIso = texto(formData, "base_date");
    const dias = Number(texto(formData, "business_days") ?? "");

    if (!desdeIso) return { error: "Indica desde qué día se cuenta el término." };
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
      return { error: "Los días hábiles deben ser un número entre 1 y 365." };
    }

    const desde = desdeISO(desdeIso);
    if (Number.isNaN(desde.getTime())) {
      return { error: "La fecha desde la que se cuenta no es válida." };
    }
    // Avisar en vez de callar: si el traslado se notificó un domingo, el
    // término no empieza a correr ese día y la cuenta saldría mal.
    if (!esHabil(desde)) {
      return {
        error:
          "Ese día no es hábil en Colombia (es fin de semana o festivo). Los términos empiezan a contar desde el día hábil siguiente.",
      };
    }

    base_date = aISO(desde);
    business_days = dias;
    due_date = aISO(sumarHabiles(desde, dias));
  } else {
    // Fecha puesta a mano: una audiencia, una reunión, un pago.
    const fijaIso = texto(formData, "due_date");
    if (!fijaIso) return { error: "Indica la fecha de vencimiento." };
    const fija = desdeISO(fijaIso);
    if (Number.isNaN(fija.getTime())) {
      return { error: "Esa fecha no es válida." };
    }
    due_date = aISO(fija);
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("deadlines").insert({
    case_id,
    title,
    kind,
    due_date,
    base_date,
    business_days,
    notes: texto(formData, "notes"),
    // Por defecto privado: compartir con la clienta es una decisión, no
    // lo que pasa si a alguien se le olvida desmarcar una casilla.
    visible_para_cliente: formData.get("visible_para_cliente") === "on",
    created_by: profile.id,
  });

  if (error) return { error: `No se pudo guardar el plazo: ${error.message}` };

  revalidatePath(`/portal/equipo/casos/${case_id}`);
  revalidatePath("/portal/equipo");
  revalidatePath("/portal/equipo/plazos");
  return { ok: true, mensaje: `Plazo registrado. Vence el ${due_date}.` };
}

export async function cerrarPlazoAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const profile = await requireEquipo();

  const id = texto(formData, "id");
  const status = texto(formData, "status");

  if (!id) return { error: "Falta el plazo." };
  if (status !== "CUMPLIDO" && status !== "CANCELADO" && status !== "PENDIENTE") {
    return { error: "Ese estado no existe." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("deadlines")
    .update({
      status,
      // Reabrir un plazo borra la marca de cierre; si no, quedaría un
      // plazo pendiente que dice haberse cumplido ayer.
      completed_at: status === "PENDIENTE" ? null : new Date().toISOString(),
      completed_by: status === "PENDIENTE" ? null : profile.id,
    })
    .eq("id", id);

  if (error) return { error: `No se pudo actualizar: ${error.message}` };

  revalidatePath("/portal/equipo", "layout");
  return { ok: true, mensaje: "Plazo actualizado." };
}

/**
 * Calcula la fecha de vencimiento para enseñarla antes de guardar.
 *
 * Vive en el servidor porque el calendario de festivos vive aquí: así el
 * navegador no tiene que descargarlo y, sobre todo, la fecha que se
 * previsualiza es exactamente la que se va a guardar.
 */
export async function calcularVencimientoAction(
  desdeIso: string,
  dias: number,
): Promise<{ iso?: string; error?: string }> {
  if (!desdeIso || !Number.isInteger(dias) || dias < 1 || dias > 365) {
    return {};
  }
  const desde = desdeISO(desdeIso);
  if (Number.isNaN(desde.getTime())) return {};
  if (!esHabil(desde)) {
    return { error: "Ese día no es hábil: fin de semana o festivo." };
  }
  return { iso: aISO(sumarHabiles(desde, dias)) };
}

/** El día de hoy en Colombia, para preseleccionarlo en el formulario. */
export async function hoyAction(): Promise<string> {
  return aISO(hoyEnColombia());
}
