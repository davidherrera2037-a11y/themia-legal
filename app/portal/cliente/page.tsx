import { requireRole } from "@/lib/auth/require-role";
import { LogoutButton } from "../LogoutButton";

export default async function ClientePage() {
  const profile = await requireRole(["CLIENTE"]);

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-ink/10 bg-cream-soft p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Hola{profile.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Este va a ser tu espacio jurídico: aquí vas a ver tus casos,
          documentos y próximos pasos.
        </p>

        <p className="mt-6 rounded-xl border border-gold/40 bg-gold-pale/40 px-4 py-3 text-sm text-ink/80">
          Todavía no hay casos cargados — eso llega en la Fase 4.
        </p>

        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
