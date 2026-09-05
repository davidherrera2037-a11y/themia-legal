"use server";

import { createClient } from "@/lib/supabase/server";
import { texto, type EstadoAccion } from "@/lib/acciones/tipos";

/**
 * Guarda una solicitud del formulario público.
 *
 * Esta es la única acción del proyecto que corre sin sesión. Lo que la
 * hace segura no es esta función sino la política RLS "leads_insert_publico":
 * quien llega de la calle puede insertar una fila con estado NUEVA y nada
 * más — no puede leer las solicitudes de otras personas, ni las suyas, ni
 * tocar ninguna otra tabla.
 *
 * Aquí solo se valida lo que da un mensaje útil en pantalla; los límites de
 * verdad (largos máximos, valores permitidos) están además en la base, que
 * es lo que se cumple aunque alguien llame a la API sin pasar por la web.
 */
export async function enviarSolicitudAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  // Campo trampa: está oculto por CSS, así que una persona nunca lo llena.
  // Los robots que rellenan todo lo que encuentran, sí. Se responde "ok"
  // para que el robot no sepa que fue descartado y no vuelva a intentarlo
  // de otra forma.
  if (texto(formData, "website")) return { ok: true };

  const full_name = texto(formData, "full_name");
  const area = texto(formData, "area");

  if (!full_name || full_name.length < 2) {
    return { error: "Escribe tu nombre para poder responderte." };
  }
  if (full_name.length > 120) {
    return { error: "Ese nombre es demasiado largo." };
  }
  if (!area) {
    return { error: "Elige el área de tu consulta." };
  }

  const message = texto(formData, "message");
  if (message && message.length > 2000) {
    return { error: "El mensaje es muy largo. Cuéntanoslo en pocas líneas." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    full_name,
    area,
    message,
    phone: texto(formData, "phone"),
    email: texto(formData, "email"),
    status: "NUEVA",
    source: "WEB",
  });

  if (error) {
    // Que falle el guardado no debe dejar a la persona sin camino: el
    // formulario le sigue ofreciendo WhatsApp. Por eso esto no es un error
    // fatal, solo un aviso.
    return {
      error:
        "No pudimos guardar tu solicitud, pero puedes escribirnos por WhatsApp ahora mismo.",
    };
  }

  return { ok: true };
}
