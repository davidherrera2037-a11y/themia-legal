import Link from "next/link";
import { requireRole } from "@/lib/auth/require-role";
import { createClientAction } from "../actions";

const ID_TYPES = ["CC", "CE", "PASAPORTE", "NIT", "OTRO"];

export default async function NuevoClientePage() {
  await requireRole(["SUPER_ADMIN", "ADMINISTRATIVA", "ABOGADA"]);

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-xl">
        <Link
          href="/portal/equipo/clientes"
          className="text-sm text-ink/60 hover:text-ink"
        >
          ← Volver
        </Link>

        <div className="mt-4 rounded-3xl border border-ink/10 bg-cream-soft p-8">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Nuevo cliente
          </h1>

          <form action={createClientAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Nombre completo
              </label>
              <input
                name="full_name"
                type="text"
                required
                className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Tipo de documento
                </label>
                <select
                  name="identification_type"
                  defaultValue="CC"
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                >
                  {ID_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Número de documento
                </label>
                <input
                  name="identification_number"
                  type="text"
                  required
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Correo
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Dirección
              </label>
              <input
                name="address"
                type="text"
                className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Ciudad
              </label>
              <input
                name="city"
                type="text"
                className="w-full rounded-xl border border-ink/20 bg-cream px-4 py-2.5 text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
            >
              Guardar cliente
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
