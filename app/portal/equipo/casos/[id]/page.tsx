import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEquipo } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Vacio } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LineaTiempo, type Evento } from "@/components/portal/LineaTiempo";
import { FilaPlazo, diasQueFaltan, type Plazo } from "@/components/portal/Plazo";
import {
  ListaDocumentos,
  SubirDocumento,
  type Documento,
} from "@/components/portal/Documentos";
import { NuevoPlazo } from "./NuevoPlazo";
import { CerrarPlazo } from "./CerrarPlazo";
import { aISO, hoyEnColombia } from "@/lib/legal/festivos";
import { CambiarEstado } from "./CambiarEstado";
import { NuevaActuacion } from "./NuevaActuacion";
import { AsignarAbogada } from "./AsignarAbogada";
import {
  AREAS,
  ESTADOS_CASO,
  PRIORIDADES,
  TIPOS_CASO,
  TONO_PRIORIDAD,
  fechaCorta,
  type Area,
  type EstadoCaso,
  type Prioridad,
  type TipoCaso,
} from "@/lib/db/tipos";

type Caso = {
  id: string;
  title: string;
  description: string | null;
  client_objective: string | null;
  area: string;
  case_type: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  responsible_lawyer_id: string | null;
  client_id: string;
  clients: {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    city: string | null;
    identification_type: string;
    identification_number: string;
  } | null;
};

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/45">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function DetalleCasoPage({
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
      "id, title, description, client_objective, area, case_type, status, priority, created_at, updated_at, responsible_lawyer_id, client_id, " +
        "clients(id, full_name, phone, email, city, identification_type, identification_number)",
    )
    .eq("id", id)
    .maybeSingle();

  // maybeSingle en vez de single: si RLS recorta la fila o el identificador
  // no existe, esto es un 404 normal y no un error de servidor.
  if (!caso) notFound();
  const c = caso as unknown as Caso;

  const [{ data: eventos }, { data: abogadas }, { data: plazos }, { data: documentos }] =
    await Promise.all([
    supabase
      .from("case_events")
      .select("id, kind, title, detail, occurred_at, author_name, visible_para_cliente")
      .eq("case_id", id)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", ["ABOGADA", "SUPER_ADMIN"])
      .eq("status", "ACTIVE")
      .order("full_name", { ascending: true }),
    supabase
      .from("deadlines")
      .select(
        "id, case_id, title, kind, due_date, base_date, business_days, status, notes, visible_para_cliente",
      )
      .eq("case_id", id)
      // Lo pendiente primero y lo que antes vence arriba: es el orden en
      // que hay que mirarlo, no el orden en que se apuntó.
      .order("status", { ascending: true })
      .order("due_date", { ascending: true }),
    supabase
      .from("case_documents")
      .select(
        "id, file_name, mime_type, size_bytes, kind, description, visible_para_cliente, uploaded_by_name, created_at",
      )
      .eq("case_id", id)
      .order("created_at", { ascending: false }),
  ]);

  // responsible_lawyer_id apunta a auth.users, no a profiles, así que
  // PostgREST no puede resolver el nombre solo. Se cruza aquí, con la lista
  // que de todas formas hace falta para el desplegable de asignación.
  const responsable = (abogadas ?? []).find(
    (a) => a.id === c.responsible_lawyer_id,
  );

  const listaPlazos = (plazos ?? []) as Plazo[];
  const listaDocs = (documentos ?? []) as Documento[];
  const pendientes = listaPlazos.filter((pl) => pl.status === "PENDIENTE");
  // El más urgente de los pendientes, para avisarlo arriba del todo.
  const masUrgente = pendientes[0];
  const diasUrgente = masUrgente ? diasQueFaltan(masUrgente.due_date) : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal/equipo/casos"
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Volver a casos
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              {c.title}
            </h1>
            <p className="mt-1 text-sm text-ink/60">
              {c.clients ? (
                <Link
                  href={`/portal/equipo/clientes/${c.clients.id}`}
                  className="underline underline-offset-2 hover:text-ink"
                >
                  {c.clients.full_name}
                </Link>
              ) : (
                "(sin clienta)"
              )}{" "}
              · {AREAS[c.area as Area] ?? c.area} ·{" "}
              {TIPOS_CASO[c.case_type as TipoCaso] ?? c.case_type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tono={TONO_PRIORIDAD[c.priority as Prioridad]}>
              {PRIORIDADES[c.priority as Prioridad] ?? c.priority}
            </Badge>
            <Badge tono="oro">
              {ESTADOS_CASO[c.status as EstadoCaso]?.equipo ?? c.status}
            </Badge>
          </div>
        </div>
      </div>

      {masUrgente && diasUrgente !== null && diasUrgente <= 2 && (
        <p
          role="alert"
          className={`rounded-2xl border px-5 py-4 text-sm ${
            diasUrgente < 0
              ? "border-red-800/30 bg-red-50 text-red-900"
              : "border-amber-800/30 bg-amber-50 text-amber-900"
          }`}
        >
          <strong className="font-semibold">
            {diasUrgente < 0
              ? "Plazo vencido"
              : diasUrgente === 0
                ? "Vence hoy"
                : "Vence en menos de dos días hábiles"}
            :
          </strong>{" "}
          {masUrgente.title}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle>Registrar actuación</CardTitle>
            <p className="mt-1 text-xs text-ink/55">
              Lo que escribas aquí es interno salvo que marques la casilla de
              compartir con la clienta.
            </p>
            <NuevaActuacion casoId={c.id} />
          </Card>

          <Card>
            <CardTitle
              hint={
                pendientes.length > 0
                  ? `${pendientes.length} pendiente${pendientes.length === 1 ? "" : "s"}`
                  : undefined
              }
            >
              Plazos y vencimientos
            </CardTitle>
            <p className="mt-1 text-xs text-ink/55">
              Los términos se cuentan en días hábiles descontando los
              festivos de Colombia.
            </p>

            <div className="mt-4">
              {listaPlazos.length === 0 ? (
                <Vacio>
                  Sin plazos apuntados. Un caso sin términos controlados es
                  un caso a la espera de un problema.
                </Vacio>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {listaPlazos.map((pl) => (
                    <FilaPlazo
                      key={pl.id}
                      plazo={pl}
                      accion={
                        <CerrarPlazo
                          id={pl.id}
                          pendiente={pl.status === "PENDIENTE"}
                        />
                      }
                    />
                  ))}
                </ul>
              )}
            </div>

            <details className="group mt-5 border-t border-ink/10 pt-5">
              <summary className="cursor-pointer list-none text-sm font-medium text-ink/75 transition-colors hover:text-ink">
                <span className="group-open:hidden">+ Registrar un plazo</span>
                <span className="hidden group-open:inline">
                  − Cerrar el formulario
                </span>
              </summary>
              <NuevoPlazo casoId={c.id} hoy={aISO(hoyEnColombia())} />
            </details>
          </Card>

          <Card>
            <CardTitle hint={`${listaDocs.length}`}>Documentos</CardTitle>
            <p className="mt-1 text-xs text-ink/55">
              Guardados en un depósito privado: cada descarga usa un enlace
              que caduca al minuto, no una dirección fija.
            </p>

            <div className="mt-4">
              <ListaDocumentos documentos={listaDocs} gestionable />
            </div>

            <details className="group mt-5 border-t border-ink/10 pt-5">
              <summary className="cursor-pointer list-none text-sm font-medium text-ink/75 transition-colors hover:text-ink">
                <span className="group-open:hidden">+ Subir un documento</span>
                <span className="hidden group-open:inline">
                  − Cerrar el formulario
                </span>
              </summary>
              <SubirDocumento casoId={c.id} />
            </details>
          </Card>

          <Card>
            <CardTitle hint={`${eventos?.length ?? 0} registradas`}>
              Línea de tiempo
            </CardTitle>
            <div className="mt-4">
              {!eventos || eventos.length === 0 ? (
                <Vacio>
                  Todavía no hay actuaciones. La primera cuenta la historia del
                  caso desde el principio.
                </Vacio>
              ) : (
                <LineaTiempo eventos={eventos as Evento[]} mostrarVisibilidad />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>Estado del caso</CardTitle>
            <CambiarEstado casoId={c.id} estadoActual={c.status} />
          </Card>

          <Card>
            <CardTitle>Responsable</CardTitle>
            <AsignarAbogada
              casoId={c.id}
              actual={c.responsible_lawyer_id}
              abogadas={abogadas ?? []}
            />
          </Card>

          <Card>
            <CardTitle>Ficha</CardTitle>
            <dl className="mt-4 space-y-3">
              <Dato etiqueta="Responsable">
                {responsable?.full_name || "Sin asignar"}
              </Dato>
              <Dato etiqueta="Abierto">{fechaCorta(c.created_at)}</Dato>
              <Dato etiqueta="Último movimiento">
                {fechaCorta(c.updated_at)}
              </Dato>
              {c.clients && (
                <>
                  <Dato etiqueta="Documento">
                    {c.clients.identification_type}{" "}
                    {c.clients.identification_number}
                  </Dato>
                  <Dato etiqueta="Contacto">
                    {c.clients.phone ? (
                      <a
                        href={`https://wa.me/${c.clients.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {c.clients.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                    {c.clients.email ? ` · ${c.clients.email}` : ""}
                  </Dato>
                </>
              )}
            </dl>
          </Card>

          {(c.description || c.client_objective) && (
            <Card>
              <CardTitle>Planteamiento</CardTitle>
              <dl className="mt-4 space-y-4">
                {c.client_objective && (
                  <Dato etiqueta="Lo que busca la clienta">
                    <span className="whitespace-pre-line">
                      {c.client_objective}
                    </span>
                  </Dato>
                )}
                {c.description && (
                  <Dato etiqueta="Descripción interna">
                    <span className="whitespace-pre-line">{c.description}</span>
                  </Dato>
                )}
              </dl>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
