import Link from "next/link";
import { requireEquipo } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { FormularioClienta } from "./FormularioClienta";

export default async function NuevaClientaPage({
  searchParams,
}: {
  searchParams: Promise<{ nombre?: string; telefono?: string; correo?: string }>;
}) {
  await requireEquipo();
  // Los valores pueden venir prellenados desde una solicitud del sitio,
  // para no volver a teclear lo que la persona ya escribió.
  const { nombre, telefono, correo } = await searchParams;

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/portal/equipo/clientes"
        className="text-sm text-ink/60 hover:text-ink"
      >
        ← Volver a clientas
      </Link>

      <Card className="mt-4">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Nueva clienta
        </h1>
        <FormularioClienta
          valoresIniciales={{ full_name: nombre, phone: telefono, email: correo }}
        />
      </Card>
    </div>
  );
}
