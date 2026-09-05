import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { FormularioCaso } from "../../nuevo/FormularioCaso";

export default async function EditarCasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEquipo();
  const { id } = await params;

  const supabase = await createClient();
  const { data: caso } = await supabase
    .from("cases")
    .select(
      "id, title, area, case_type, priority, description, client_objective, clients(full_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!caso) notFound();

  const clienta = (caso.clients as unknown as { full_name: string } | null)
    ?.full_name;

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/portal/equipo/casos/${id}`}
        className="text-sm text-ink/60 hover:text-ink"
      >
        ← Volver al expediente
      </Link>

      <Card className="mt-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Corregir el caso
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          {clienta ? `Clienta: ${clienta}. ` : ""}
          La clienta, la abogada responsable y el estado se cambian desde el
          expediente, cada uno con su propio control.
        </p>

        <FormularioCaso
          clientes={[]}
          abogadas={[]}
          valores={{
            id: caso.id,
            title: caso.title,
            area: caso.area,
            case_type: caso.case_type,
            priority: caso.priority,
            description: caso.description,
            client_objective: caso.client_objective,
          }}
        />
      </Card>
    </div>
  );
}
