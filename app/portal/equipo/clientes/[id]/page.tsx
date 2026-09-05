import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Vacio } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { VincularCuenta } from "./VincularCuenta";
import { EstadoClienta } from "./EstadoClienta";
import {
  AREAS,
  ESTADOS_CASO,
  PRIORIDADES,
  TIPOS_DOCUMENTO,
  TONO_PRIORIDAD,
  fechaCorta,
  type Area,
  type EstadoCaso,
  type Prioridad,
  type TipoDocumento,
} from "@/lib/db/tipos";

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/45">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children || "—"}</dd>
    </div>
  );
}

export default async function DetalleClientaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireEquipo();
  const { id } = await params;

  const supabase = await createClient();

  const { data: clienta } = await supabase
    .from("clients")
    .select(
      "id, full_name, identification_type, identification_number, phone, email, address, city, status, user_id, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!clienta) notFound();

  // Vincular cuentas mueve quién puede leer un expediente desde fuera, así
  // que solo lo ve quien administra. Una ABOGADA tampoco puede listar los
  // perfiles de clientas por RLS: enseñarle un desplegable vacío sería
  // hacerle creer que no hay cuentas cuando lo que pasa es que no las ve.
  const puedeVincular =
    profile.role === "SUPER_ADMIN" || profile.role === "ADMINISTRATIVA";

  const [{ data: casos }, { data: cuentas }, { data: yaVinculadas }] =
    await Promise.all([
      supabase
        .from("cases")
        .select("id, title, area, status, priority, updated_at")
        .eq("client_id", id)
        .order("updated_at", { ascending: false }),
      puedeVincular && !clienta.user_id
        ? supabase
            .from("profiles")
            .select("id, email, full_name")
            .eq("role", "CLIENTE")
            .eq("status", "ACTIVE")
        : Promise.resolve({ data: null }),
      puedeVincular && !clienta.user_id
        ? supabase.from("clients").select("user_id").not("user_id", "is", null)
        : Promise.resolve({ data: null }),
    ]);

  const ocupadas = new Set((yaVinculadas ?? []).map((c) => c.user_id));
  const disponibles = (cuentas ?? []).filter((c) => !ocupadas.has(c.id));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal/equipo/clientes"
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Volver a clientas
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              {clienta.full_name}
            </h1>
            <p className="mt-1 text-sm text-ink/60">
              {TIPOS_DOCUMENTO[clienta.identification_type as TipoDocumento] ??
                clienta.identification_type}{" "}
              {clienta.identification_number} · desde{" "}
              {fechaCorta(clienta.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/portal/equipo/clientes/${clienta.id}/editar`}
              className="rounded-full border border-ink/20 px-3.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-ink hover:text-cream"
            >
              Corregir
            </Link>
            {clienta.user_id ? (
              <Badge tono="exito">Con acceso al portal</Badge>
            ) : (
              <Badge>Sin cuenta</Badge>
            )}
            {clienta.status === "INACTIVE" && <Badge tono="alerta">Inactiva</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle hint={`${casos?.length ?? 0} en total`}>
              Casos de esta clienta
            </CardTitle>
            <div className="mt-4">
              {!casos || casos.length === 0 ? (
                <Vacio>Todavía no tiene casos abiertos.</Vacio>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {casos.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/portal/equipo/casos/${c.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-ink/[0.03]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">
                            {c.title}
                          </span>
                          <span className="block text-xs text-ink/60">
                            {AREAS[c.area as Area] ?? c.area} · movido{" "}
                            {fechaCorta(c.updated_at)}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge tono={TONO_PRIORIDAD[c.priority as Prioridad]}>
                            {PRIORIDADES[c.priority as Prioridad] ?? c.priority}
                          </Badge>
                          <Badge tono="oro">
                            {ESTADOS_CASO[c.status as EstadoCaso]?.equipo ??
                              c.status}
                          </Badge>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-6">
              <ButtonLink
                href={`/portal/equipo/casos/nuevo?cliente=${clienta.id}`}
                tamano="sm"
              >
                + Nuevo caso para {clienta.full_name.split(" ")[0]}
              </ButtonLink>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Datos de contacto</CardTitle>
            <dl className="mt-4 space-y-3">
              <Dato etiqueta="Teléfono">
                {clienta.phone ? (
                  <a
                    href={`https://wa.me/${clienta.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {clienta.phone}
                  </a>
                ) : null}
              </Dato>
              <Dato etiqueta="Correo">{clienta.email}</Dato>
              <Dato etiqueta="Dirección">{clienta.address}</Dato>
              <Dato etiqueta="Ciudad">{clienta.city}</Dato>
            </dl>
          </Card>

          {!clienta.user_id && puedeVincular && (
            <Card>
              <CardTitle>Acceso al portal</CardTitle>
              <VincularCuenta clientaId={clienta.id} cuentas={disponibles} />
            </Card>
          )}

          <Card>
            <CardTitle>Estado</CardTitle>
            <EstadoClienta clientaId={clienta.id} actual={clienta.status} />
          </Card>
        </div>
      </div>
    </div>
  );
}
