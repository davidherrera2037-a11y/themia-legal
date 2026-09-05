import Link from "next/link";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, Vacio } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { BuscadorClientas } from "./BuscadorClientas";

type Clienta = {
  id: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  phone: string | null;
  city: string | null;
  status: string;
  user_id: string | null;
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; inactivas?: string }>;
}) {
  await requireEquipo();
  const { q, inactivas } = await searchParams;

  const supabase = await createClient();
  let consulta = supabase
    .from("clients")
    .select(
      "id, full_name, identification_type, identification_number, phone, city, status, user_id",
    )
    .order("full_name", { ascending: true });

  if (!inactivas) consulta = consulta.eq("status", "ACTIVE");

  // `or` con ilike busca por nombre o por documento en la misma consulta.
  // El % va a los dos lados porque nadie recuerda cómo empieza una cédula.
  const busqueda = q?.trim();
  if (busqueda) {
    const patron = `%${busqueda.replace(/[%,]/g, "")}%`;
    consulta = consulta.or(
      `full_name.ilike.${patron},identification_number.ilike.${patron}`,
    );
  }

  const { data, error } = await consulta;
  const clientas = (data ?? []) as Clienta[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Clientas
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {clientas.length}{" "}
            {clientas.length === 1 ? "registro" : "registros"}
            {inactivas ? "" : " · inactivas ocultas"}
          </p>
        </div>
        <ButtonLink href="/portal/equipo/clientes/nuevo">
          + Nueva clienta
        </ButtonLink>
      </div>

      <BuscadorClientas />

      <Card className="p-4 sm:p-5">
        {error ? (
          <Vacio>No se pudieron cargar las clientas. Inténtalo de nuevo.</Vacio>
        ) : clientas.length === 0 ? (
          <Vacio>
            {busqueda
              ? "Ninguna clienta coincide con esa búsqueda."
              : "Todavía no hay clientas registradas. Crea la primera con el botón de arriba."}
          </Vacio>
        ) : (
          <ul className="divide-y divide-ink/10">
            {clientas.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/portal/equipo/clientes/${c.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-ink/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {c.full_name}
                    </span>
                    <span className="block text-xs text-ink/60">
                      {c.identification_type} {c.identification_number}
                      {c.city ? ` · ${c.city}` : ""}
                      {c.phone ? ` · ${c.phone}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {c.user_id ? (
                      <Badge tono="exito">Con acceso al portal</Badge>
                    ) : (
                      <Badge>Sin cuenta</Badge>
                    )}
                    {c.status === "INACTIVE" && <Badge tono="alerta">Inactiva</Badge>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
