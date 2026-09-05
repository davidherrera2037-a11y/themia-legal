import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Vacio } from "@/components/ui/Card";
import { FilaPlazo, diasQueFaltan, type Plazo } from "@/components/portal/Plazo";
import { CerrarPlazo } from "../casos/[id]/CerrarPlazo";

/**
 * La bandeja de vencimientos: todo lo que vence, de todos los casos.
 *
 * Es la pantalla con la que se empieza el día. Por eso se agrupa por
 * urgencia y no por caso ni por fecha: lo que importa no es de quién es el
 * término, sino cuál se va a pasar.
 */
export default async function PlazosPage({
  searchParams,
}: {
  searchParams: Promise<{ cerrados?: string }>;
}) {
  await requireEquipo();
  const { cerrados } = await searchParams;

  const supabase = await createClient();
  let consulta = supabase
    .from("deadlines")
    .select(
      "id, case_id, title, kind, due_date, base_date, business_days, status, notes, visible_para_cliente, cases(title, clients(full_name))",
    )
    .order("due_date", { ascending: true });

  if (!cerrados) consulta = consulta.eq("status", "PENDIENTE");

  const { data, error } = await consulta;
  const plazos = (data ?? []) as unknown as Plazo[];

  const pendientes = plazos.filter((p) => p.status === "PENDIENTE");
  const vencidos = pendientes.filter((p) => diasQueFaltan(p.due_date) < 0);
  const hoyMismo = pendientes.filter((p) => diasQueFaltan(p.due_date) === 0);
  const estaSemana = pendientes.filter((p) => {
    const d = diasQueFaltan(p.due_date);
    return d >= 1 && d <= 5;
  });
  const despues = pendientes.filter((p) => diasQueFaltan(p.due_date) > 5);
  const cerradosLista = plazos.filter((p) => p.status !== "PENDIENTE");

  const grupos = [
    { titulo: "Vencidos", lista: vencidos, nota: "Requieren explicación, no prisa." },
    { titulo: "Vencen hoy", lista: hoyMismo, nota: undefined },
    {
      titulo: "Próximos cinco días hábiles",
      lista: estaSemana,
      nota: undefined,
    },
    { titulo: "Más adelante", lista: despues, nota: undefined },
    ...(cerrados
      ? [{ titulo: "Cerrados", lista: cerradosLista, nota: undefined }]
      : []),
  ].filter((g) => g.lista.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Vencimientos
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {pendientes.length}{" "}
            {pendientes.length === 1 ? "plazo pendiente" : "plazos pendientes"}
            {vencidos.length > 0 ? ` · ${vencidos.length} vencido(s)` : ""}
          </p>
        </div>
        <a
          href={cerrados ? "/portal/equipo/plazos" : "/portal/equipo/plazos?cerrados=1"}
          className="rounded-full border border-ink/20 px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          {cerrados ? "Ver solo pendientes" : "Ver también los cerrados"}
        </a>
      </div>

      {error ? (
        <Card>
          <Vacio>
            No se pudieron cargar los plazos. Si acabas de publicar, comprueba
            que aplicaste la migración 0008 en Supabase.
          </Vacio>
        </Card>
      ) : grupos.length === 0 ? (
        <Card>
          <Vacio>
            Nada pendiente de vencer. Los plazos se apuntan desde cada caso.
          </Vacio>
        </Card>
      ) : (
        grupos.map((g) => (
          <Card key={g.titulo} className="p-4 sm:p-6">
            <CardTitle hint={`${g.lista.length}`}>{g.titulo}</CardTitle>
            {g.nota && <p className="mt-1 text-xs text-ink/55">{g.nota}</p>}
            <ul className="mt-2 divide-y divide-ink/10">
              {g.lista.map((pl) => (
                <FilaPlazo
                  key={pl.id}
                  plazo={pl}
                  conCaso
                  accion={
                    <CerrarPlazo id={pl.id} pendiente={pl.status === "PENDIENTE"} />
                  }
                />
              ))}
            </ul>
          </Card>
        ))
      )}
    </div>
  );
}
