import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "../LogoutButton";

export default async function EquipoPage() {
  const profile = await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"]);

  // RLS decide qué filas llegan de verdad: SUPER_ADMIN/ADMINISTRATIVA ven
  // a todo el equipo; ABOGADA solo se ve a sí misma (por eso el listado
  // de abajo solo se muestra para los dos primeros roles).
  const canSeeTeam = profile.role === "SUPER_ADMIN" || profile.role === "ADMINISTRATIVA";

  const supabase = await createClient();
  const { data: team } = canSeeTeam
    ? await supabase
        .from("profiles")
        .select("id, full_name, role, status, created_at")
        .order("created_at", { ascending: true })
    : { data: null };

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-ink/10 bg-cream-soft p-8">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Bienvenida{profile.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-ink/70">Rol: {profile.role}</p>

          <p className="mt-6 rounded-xl border border-gold/40 bg-gold-pale/40 px-4 py-3 text-sm text-ink/80">
            Fase 2: separación de roles funcionando. Casos y expedientes
            llegan en las próximas fases.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/portal/equipo/clientes"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
            >
              Ver clientes
            </Link>
            <Link
              href="/portal/equipo/casos"
              className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              Ver casos
            </Link>
            <LogoutButton />
          </div>
        </div>

        {canSeeTeam && (
          <div className="mt-6 rounded-3xl border border-ink/10 bg-cream-soft p-8">
            <h2 className="font-display text-lg font-semibold text-ink">
              Equipo
            </h2>
            <ul className="mt-4 divide-y divide-ink/10">
              {team?.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-ink">
                    {member.full_name || "(sin nombre)"}
                  </span>
                  <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink/70">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
