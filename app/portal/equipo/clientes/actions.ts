"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

export async function createClientAction(formData: FormData) {
  // Vuelve a exigir el rol aquí, del lado del servidor — el formulario
  // no es la protección real, esto sí lo es.
  await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"]);

  const full_name = String(formData.get("full_name") ?? "").trim();
  const identification_type = String(formData.get("identification_type") ?? "CC");
  const identification_number = String(
    formData.get("identification_number") ?? ""
  ).trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;

  if (!full_name || !identification_number) {
    throw new Error("Nombre y número de documento son obligatorios.");
  }

  const supabase = await createSupabaseClient();

  const { error } = await supabase.from("clients").insert({
    full_name,
    identification_type,
    identification_number,
    phone,
    email,
    address,
    city,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/portal/equipo/clientes");
  redirect("/portal/equipo/clientes");
}
