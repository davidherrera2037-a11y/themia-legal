import Link from "next/link";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, Vacio } from "@/components/ui/Card";
import { FormularioCaso } from "./FormularioCaso";

export default async function NuevoCasoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  await requireEquipo();
  const { cliente } = await searchParams;

  const supabase = await createClient();
  const [{ data: clientes }, { data: abogadas }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, full_name")
      .eq("status", "ACTIVE")
      .order("full_name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", ["ABOGADA", "SUPER_ADMIN"])
      .eq("status", "ACTIVE")
      .order("full_name", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/portal/equipo/casos"
        className="text-sm text-ink/60 hover:text-ink"
      >
        ← Volver a casos
      </Link>

      <Card className="mt-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Nuevo caso
        </h1>

        {!clientes || clientes.length === 0 ? (
          <div className="mt-4">
            <Vacio>
              Todavía no hay clientas registradas. Crea una primero en{" "}
              <Link href="/portal/equipo/clientes/nuevo" className="underline">
                Clientas
              </Link>
              .
            </Vacio>
          </div>
        ) : (
          <FormularioCaso
            clientes={clientes}
            abogadas={abogadas ?? []}
            clientePreseleccionado={cliente}
          />
        )}
      </Card>
    </div>
  );
}
