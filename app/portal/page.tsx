import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export default async function PortalHome() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-ink/10 bg-cream-soft p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Bienvenida{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-ink/70">Correo: {user.email}</p>
        <p className="mt-1 text-sm text-ink/70">
          Rol: {profile?.role ?? "sin asignar"}
        </p>

        <p className="mt-6 rounded-xl border border-gold/40 bg-gold-pale/40 px-4 py-3 text-sm text-ink/80">
          Esto es la Fase 1: solo confirma que el inicio de sesión y los
          roles funcionan de verdad. Expedientes, documentos y todo lo
          demás llegan en las siguientes fases.
        </p>

        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
