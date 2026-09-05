import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { FormularioClienta } from "../../nuevo/FormularioClienta";

export default async function EditarClientaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEquipo();
  const { id } = await params;

  const supabase = await createClient();
  const { data: clienta } = await supabase
    .from("clients")
    .select(
      "id, full_name, identification_type, identification_number, phone, email, address, city",
    )
    .eq("id", id)
    .maybeSingle();

  if (!clienta) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href={`/portal/equipo/clientes/${id}`}
        className="text-sm text-ink/60 hover:text-ink"
      >
        ← Volver a la ficha
      </Link>

      <Card className="mt-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Corregir los datos
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          El estado y la cuenta de acceso se cambian desde la ficha.
        </p>

        <FormularioClienta valoresIniciales={clienta} />
      </Card>
    </div>
  );
}
