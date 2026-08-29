import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  LEAD: "Contacto inicial",
  CONSULTATION: "En consulta",
  ANALYSIS: "En análisis",
  ACTIVE: "Activo",
  WAITING_CLIENT: "Esperando a la clienta",
  WAITING_AUTHORITY: "Esperando a la autoridad",
  HEARING_SCHEDULED: "Audiencia programada",
  IN_PROGRESS: "En trámite",
  CLOSED: "Cerrado",
  ARCHIVED: "Archivado",
};

export default async function CasosPage() {
  await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"]);

  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("cases")
    .select("id, title, area, status, priority, clients(full_name)")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/portal/equipo"
              className="text-sm text-ink/60 hover:text-ink"
            >
              ← Volver
            </Link>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
              Casos
            </h1>
          </div>
          <Link
            href="/portal/equipo/casos/nuevo"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
          >
            + Nuevo caso
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-ink/10 bg-cream-soft p-6">
          {!cases || cases.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/60">
              Todavía no hay casos registrados. Primero necesitas al
              menos un cliente creado, luego crea el primer caso con el
              botón de arriba.
            </p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {cases.map((c) => (
                <li key={c.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink">{c.title}</p>
                      <p className="text-xs text-ink/60">
                        {(c.clients as unknown as { full_name: string } | null)
                          ?.full_name ?? "(sin cliente)"}{" "}
                        · {c.area}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gold-pale px-3 py-1 text-xs font-medium text-ink/70">
                        {c.priority}
                      </span>
                      <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink/70">
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
