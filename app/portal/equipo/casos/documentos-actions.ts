"use server";

import { revalidatePath } from "next/cache";
import { requireEquipo } from "@/lib/auth/require-role";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { texto, unoDe, type EstadoAccion } from "@/lib/acciones/tipos";
import {
  FORMATOS_ADMITIDOS,
  TAMANO_MAXIMO,
  TIPOS_DOCUMENTO_CASO,
} from "@/lib/db/tipos";

const BUCKET = "expedientes";

/**
 * Limpia el nombre del archivo para usarlo en una ruta.
 *
 * Un nombre de archivo llega tal cual lo tenía la persona: tildes,
 * espacios, barras, emojis. Las barras son lo peligroso —crearían carpetas
 * dentro del bucket y romperían la correspondencia entre la ruta y el
 * caso— así que se reduce a lo que no puede sorprender.
 */
function nombreSeguro(nombre: string): string {
  const limpio = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return (limpio || "documento").slice(-120);
}

export async function subirDocumentoAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const profile = await requireEquipo();

  const case_id = texto(formData, "case_id");
  if (!case_id) return { error: "Falta el caso." };

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Elige un archivo." };
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return {
      error: `El archivo pesa demasiado (máximo 20 MB). Si es un escaneo, súbelo en menor resolución.`,
    };
  }
  if (!FORMATOS_ADMITIDOS[archivo.type]) {
    return {
      error: `Ese formato no se admite. Se aceptan: ${[
        ...new Set(Object.values(FORMATOS_ADMITIDOS)),
      ].join(", ")}.`,
    };
  }

  const supabase = await createSupabaseClient();

  // La ruta lleva el caso delante para que un archivo nunca quede
  // huérfano, y un identificador aleatorio para que subir dos veces el
  // mismo nombre no pise el anterior.
  const storage_path = `${case_id}/${crypto.randomUUID()}-${nombreSeguro(archivo.name)}`;

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(storage_path, archivo, {
      contentType: archivo.type,
      upsert: false,
    });

  if (errorSubida) {
    return { error: `No se pudo subir el archivo: ${errorSubida.message}` };
  }

  const { error: errorFila } = await supabase.from("case_documents").insert({
    case_id,
    storage_path,
    file_name: archivo.name.slice(0, 255),
    mime_type: archivo.type,
    size_bytes: archivo.size,
    kind: unoDe(texto(formData, "kind"), TIPOS_DOCUMENTO_CASO, "OTRO"),
    description: texto(formData, "description"),
    visible_para_cliente: formData.get("visible_para_cliente") === "on",
    uploaded_by: profile.id,
    uploaded_by_name: profile.full_name ?? profile.email,
  });

  if (errorFila) {
    // El archivo ya está arriba pero nadie sabría que existe: sin fila, no
    // aparece en ninguna pantalla y no hay forma de borrarlo desde la
    // aplicación. Se deshace la subida para no dejar basura invisible.
    await supabase.storage.from(BUCKET).remove([storage_path]);
    return { error: `No se pudo registrar el documento: ${errorFila.message}` };
  }

  revalidatePath(`/portal/equipo/casos/${case_id}`);
  return { ok: true, mensaje: `"${archivo.name}" subido.` };
}

export async function cambiarVisibilidadDocumentoAction(
  _previo: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  await requireEquipo();

  const id = texto(formData, "id");
  const visible = formData.get("visible") === "1";
  if (!id) return { error: "Falta el documento." };

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("case_documents")
    .update({ visible_para_cliente: visible })
    .eq("id", id);

  if (error) return { error: `No se pudo actualizar: ${error.message}` };

  revalidatePath("/portal/equipo", "layout");
  return {
    ok: true,
    mensaje: visible
      ? "Ahora la clienta puede verlo."
      : "Ya no es visible para la clienta.",
  };
}

/**
 * Devuelve un enlace de descarga que caduca en un minuto.
 *
 * El bucket es privado: no hay URL permanente que se pueda reenviar por
 * WhatsApp y siga funcionando mañana. El enlace se firma en el momento y
 * con la sesión de quien lo pide, así que si esa persona no tiene derecho
 * a ese archivo, Storage no lo firma — la comprobación no depende de esta
 * función.
 *
 * Lo usan las dos caras del portal, y por eso vive fuera de requireEquipo.
 */
export async function enlaceDescargaAction(
  documentoId: string,
): Promise<{ url?: string; error?: string }> {
  await getProfile(); // exige sesión; el resto lo decide RLS
  if (!documentoId) return { error: "Falta el documento." };

  const supabase = await createSupabaseClient();

  const { data: doc } = await supabase
    .from("case_documents")
    .select("storage_path, file_name")
    .eq("id", documentoId)
    .maybeSingle();

  if (!doc) return { error: "Ese documento no está disponible para tu cuenta." };

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60, { download: doc.file_name });

  if (error || !data) {
    return { error: "No se pudo generar el enlace de descarga." };
  }
  return { url: data.signedUrl };
}
