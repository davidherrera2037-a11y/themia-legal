import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function ClientesPage() {
  await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"]);

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, identification_type, identification_number, phone, city, status")
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
              Clientes
            </h1>
          </div>
          <Link
            href="/portal/equipo/clientes/nuevo"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
          >
            + Nuevo cliente
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-ink/10 bg-cream-soft p-6">
          {!clients || clients.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/60">
              Todavía no hay clientes registrados. Crea el primero con el
              botón de arriba.
            </p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {clients.map((client) => (
                <li
                  key={client.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {client.full_name}
                    </p>
                    <p className="text-xs text-ink/60">
                      {client.identification_type} {client.identification_number}
                      {client.city ? ` · ${client.city}` : ""}
                      {client.phone ? ` · ${client.phone}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink/70">
                    {client.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
