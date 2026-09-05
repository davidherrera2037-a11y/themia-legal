import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Vacio } from "@/components/ui/Card";
import { ROLES, fechaHora } from "@/lib/db/tipos";
import { FilaCuenta, type Cuenta } from "./FilaCuenta";

export default async function AdminPage() {
  const yo = await requireRole(["SUPER_ADMIN"]);

  const supabase = await createClient();
  const [{ data: cuentas }, { data: bitacora }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, status, created_at")
      .order("role", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("profile_audit")
      .select(
        "id, profile_email, role_anterior, role_nuevo, status_anterior, status_nuevo, cambiado_en",
      )
      .order("cambiado_en", { ascending: false })
      .limit(25),
  ]);

  const lista = (cuentas ?? []) as Cuenta[];
  const equipo = lista.filter((c) => c.role !== "CLIENTE");
  const clientas = lista.filter((c) => c.role === "CLIENTE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Cuentas y permisos
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          El rol decide qué expedientes puede ver cada persona. Cada cambio
          queda registrado abajo.
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <CardTitle hint={`${equipo.length} cuentas`}>Equipo</CardTitle>
        {equipo.length === 0 ? (
          <div className="mt-4">
            <Vacio>Todavía no hay cuentas del equipo.</Vacio>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-ink/10">
            {equipo.map((c) => (
              <FilaCuenta key={c.id} cuenta={c} esYo={c.id === yo.id} />
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4 sm:p-6">
        <CardTitle hint={`${clientas.length} cuentas`}>
          Cuentas de clientas
        </CardTitle>
        <p className="mt-1 text-xs text-ink/55">
          Se crean solas cuando alguien se registra. Para que vea su
          expediente hay que vincularla con su ficha desde Clientas.
        </p>
        {clientas.length === 0 ? (
          <div className="mt-4">
            <Vacio>Ninguna clienta se ha registrado todavía.</Vacio>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-ink/10">
            {clientas.map((c) => (
              <FilaCuenta key={c.id} cuenta={c} esYo={c.id === yo.id} />
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4 sm:p-6">
        <CardTitle hint="últimos 25">Bitácora de cambios</CardTitle>
        <p className="mt-1 text-xs text-ink/55">
          La escribe la base de datos sola, también cuando el cambio se hace
          desde la consola de Supabase. Nadie puede editarla ni borrarla.
        </p>
        {!bitacora || bitacora.length === 0 ? (
          <div className="mt-4">
            <Vacio>Todavía no se ha cambiado ningún rol.</Vacio>
          </div>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {bitacora.map((b) => (
              <li key={b.id} className="flex flex-wrap gap-x-2 text-ink/75">
                <span className="text-ink/50">{fechaHora(b.cambiado_en)}</span>
                <span className="font-medium text-ink">
                  {b.profile_email ?? "(sin correo)"}
                </span>
                {b.role_anterior !== b.role_nuevo && (
                  <span>
                    rol:{" "}
                    {ROLES[b.role_anterior as keyof typeof ROLES] ??
                      b.role_anterior}{" "}
                    →{" "}
                    {ROLES[b.role_nuevo as keyof typeof ROLES] ?? b.role_nuevo}
                  </span>
                )}
                {b.status_anterior !== b.status_nuevo && (
                  <span>
                    estado: {b.status_anterior} → {b.status_nuevo}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
