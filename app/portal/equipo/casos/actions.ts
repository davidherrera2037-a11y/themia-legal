"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/require-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

export async function createCaseAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"]);

  const client_id = String(formData.get("client_id") ?? "");
  const responsible_lawyer_id =
    String(formData.get("responsible_lawyer_id") ?? "") || null;
  const area = String(formData.get("area") ?? "");
  const case_type = String(formData.get("case_type") ?? "CONSULTA");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const client_objective =
    String(formData.get("client_objective") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "MEDIA");

  if (!client_id || !area || !title) {
    throw new Error("Cliente, área y título son obligatorios.");
  }

  const supabase = await createSupabaseClient();

  const { error } = await supabase.from("cases").insert({
    client_id,
    responsible_lawyer_id,
    area,
    case_type,
    title,
    description,
    client_objective,
    priority,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/portal/equipo/casos");
  redirect("/portal/equipo/casos");
}
