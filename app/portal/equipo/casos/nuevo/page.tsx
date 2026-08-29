import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { createCaseAction } from "../actions";

const AREAS = [
  ["FAMILIA", "Derecho de familia"],
  ["CIVIL", "Derecho civil"],
  ["LABORAL", "Derecho laboral"],
  ["COMERCIAL_EMPRESARIAL", "Derecho comercial y empresarial"],
  ["CONSTITUCIONAL", "Derecho constitucional"],
  ["PENAL", "Derecho penal"],
  ["SERVICIOS_JURIDICOS", "Servicios jurídicos"],
];

const CASE_TYPES = [
  ["CONSULTA", "Consulta"],
  ["ASUNTO_EXTRAJUDICIAL", "Asunto extrajudicial"],
  ["PROCESO_JUDICIAL", "Proceso judicial"],
  ["TRAMITE_ADMINISTRATIVO", "Trámite administrativo"],
  ["CONCILIACION", "Conciliación"],
  ["CONTRATO", "Contrato"],
  ["OTRO", "Otro"],
];

const PRIORITIES = [
  ["BAJA", "Baja"],
  ["MEDIA", "Media"],
  ["ALTA", "Alta"],
  ["URGENTE", "Urgente"],
];

export default async function NuevoCasoPage() {
  await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"]);

  const supabase = await createClient();
  const [{ data: clients }, { data: lawyers }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, full_name")
      .order("full_name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "ABOGADA")
      .order("full_name", { ascending: true }),
  ]);

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-xl">
        <Link
          href="/portal/equipo/casos"
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Volver
        </Link>

        <div className="mt-4 rounded-3xl border border-ink/10 bg-cream-soft p-8">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Nuevo caso
          </h1>

          {!clients || clients.length === 0 ? (
            <p className="mt-4 rounded-xl border border-gold/40 bg-gold-pale/40 px-4 py-3 text-sm text-ink/80">
              Todavía no hay clientes registrados. Crea uno primero en{" "}
              <Link href="/portal/equipo/clientes/nuevo" className="underline">
                Clientes
              </Link>
              .
            </p>
          ) : (
            <form action={createCaseAction} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Cliente
                </label>
                <select
                  name="client_id"
                  required
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Abogada responsable{" "}
                  <span className="text-ink/50">(opcional por ahora)</span>
                </label>
                <select
                  name="responsible_lawyer_id"
                  defaultValue=""
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                >
                  <option value="">Sin asignar todavía</option>
                  {lawyers?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name || "(sin nombre)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Área
                  </label>
                  <select
                    name="area"
                    required
                    className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                  >
                    {AREAS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Tipo de asunto
                  </label>
                  <select
                    name="case_type"
                    defaultValue="CONSULTA"
                    className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                  >
                    {CASE_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Título del caso
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="Ej: Regulación de visitas"
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink placeholder:text-ink/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Descripción{" "}
                  <span className="text-ink/50">(lenguaje técnico, interno)</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Objetivo de la clienta{" "}
                  <span className="text-ink/50">(en sus propias palabras)</span>
                </label>
                <textarea
                  name="client_objective"
                  rows={2}
                  placeholder="Qué espera lograr la clienta con este caso"
                  className="w-full resize-none rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink placeholder:text-ink/40 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Prioridad
                </label>
                <select
                  name="priority"
                  defaultValue="MEDIA"
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                >
                  {PRIORITIES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
              >
                Guardar caso
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
