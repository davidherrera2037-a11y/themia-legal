import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, Vacio } from "@/components/ui/Card";
import { FichaSolicitud, type Solicitud } from "./FichaSolicitud";

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ todas?: string }>;
}) {
  await requireEquipo();
  const { todas } = await searchParams;

  const supabase = await createClient();
  let consulta = supabase
    .from("leads")
    .select(
      "id, full_name, area, message, phone, email, status, internal_note, created_at",
    )
    .order("created_at", { ascending: false });

  // Por defecto solo lo que queda por hacer. Las convertidas y las
  // descartadas ya no son trabajo pendiente.
  if (!todas) consulta = consulta.in("status", ["NUEVA", "CONTACTADA", "AGENDADA"]);

  const { data, error } = await consulta;
  const solicitudes = (data ?? []) as Solicitud[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Solicitudes
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Lo que llega del formulario del sitio, antes de que sea un caso.
          </p>
        </div>
        <a
          href={todas ? "/portal/equipo/solicitudes" : "/portal/equipo/solicitudes?todas=1"}
          className="rounded-full border border-ink/20 px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          {todas ? "Ver solo pendientes" : "Ver todas"}
        </a>
      </div>

      <Card className="p-4 sm:p-6">
        {error ? (
          <Vacio>
            No se pudieron cargar las solicitudes. Si acabas de publicar el
            sitio, comprueba que aplicaste la migración 0006 en Supabase.
          </Vacio>
        ) : solicitudes.length === 0 ? (
          <Vacio>
            {todas
              ? "Todavía no ha llegado ninguna solicitud."
              : "Nada pendiente. Todas las solicitudes están atendidas."}
          </Vacio>
        ) : (
          <ul className="divide-y divide-ink/10">
            {solicitudes.map((s) => (
              <FichaSolicitud key={s.id} solicitud={s} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
