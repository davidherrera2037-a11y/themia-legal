import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "../LogoutButton";

const STATUS_MESSAGES: Record<string, string> = {
  LEAD: "Registramos tu contacto inicial.",
  CONSULTATION: "Estamos en la etapa de consulta contigo.",
  ANALYSIS: "Estamos analizando tu caso.",
  ACTIVE: "Tu caso está activo.",
  WAITING_CLIENT: "Estamos esperando información de tu parte.",
  WAITING_AUTHORITY: "Estamos esperando respuesta de la autoridad.",
  HEARING_SCHEDULED: "Tienes una audiencia programada.",
  IN_PROGRESS: "Tu proceso continúa en trámite.",
  CLOSED: "Este caso está cerrado.",
  ARCHIVED: "Este caso está archivado.",
};

export default async function ClientePage() {
  const profile = await requireRole(["CLIENTE"]);

  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("cases")
    .select("id, title, area, status")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-ink/10 bg-cream-soft p-8">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Hola{profile.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-2 text-sm text-ink/70">Este es tu espacio jurídico.</p>

          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-ink/10 bg-cream-soft p-8">
          <h2 className="font-display text-lg font-semibold text-ink">
            Tus asuntos
          </h2>

          {!cases || cases.length === 0 ? (
            <p className="mt-4 rounded-xl border border-gold/40 bg-gold-pale/40 px-4 py-3 text-sm text-ink/80">
              Todavía no tienes casos asociados a tu cuenta. Si acabas de
              registrarte, tu abogada los va a vincular en breve.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {cases.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-ink/10 bg-cream px-4 py-3"
                >
                  <p className="text-sm font-medium text-ink">{c.title}</p>
                  <p className="mt-1 text-sm text-ink/70">
                    {STATUS_MESSAGES[c.status] ?? "Tu proceso continúa en trámite."}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
