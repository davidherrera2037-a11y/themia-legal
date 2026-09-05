import type { Metadata } from "next";
import Link from "next/link";
import { FormularioAcceso } from "@/components/auth/FormularioAcceso";

export const metadata: Metadata = {
  title: "Portal privado | Themia Legal",
  robots: { index: false, follow: false },
};

/**
 * Se renderiza en cada petición, no se pregenera.
 *
 * Es lo que permite que esta pantalla reciba la política de contenido con
 * nonce que pone proxy.ts: una página pregenerada no puede llevar un número
 * distinto en cada visita. Aquí es donde se teclea una contraseña, así que
 * es justo donde más vale la pena pagar ese precio.
 */
export const dynamic = "force-dynamic";

const MOTIVOS: Record<string, string> = {
  inactiva:
    "Tu cuenta está desactivada. Habla con la administradora del despacho.",
};

/**
 * ¿Está el portal conectado a su base de datos en este despliegue?
 *
 * Las variables se configuran por ambiente en Vercel, así que es normal
 * que producción las tenga y una vista previa no. Cuando faltan, mostrar
 * el formulario sería peor que inútil: aceptaría la contraseña y fallaría
 * sin decir por qué.
 */
function portalConfigurado() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; motivo?: string }>;
}) {
  const { volver, motivo } = await searchParams;
  const aviso = motivo ? MOTIVOS[motivo] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-ink/10 bg-cream-soft p-8">
          <h1 className="text-center font-display text-2xl font-semibold text-ink">
            Themia Legal
          </h1>
          <p className="mt-1 text-center text-sm text-ink/60">Portal privado</p>

          {!portalConfigurado() ? (
            <div className="mt-6 space-y-3">
              <p
                role="alert"
                className="rounded-xl border border-amber-800/25 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
              >
                El portal no está conectado a su base de datos en este
                despliegue, así que no se puede entrar todavía.
              </p>
              <p className="text-xs leading-relaxed text-ink/60">
                Si administras el sitio: faltan las variables{" "}
                <code className="rounded bg-ink/5 px-1">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                y{" "}
                <code className="rounded bg-ink/5 px-1">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>
                . En Vercel se definen por ambiente, así que hay que
                marcarlas también para <em>Preview</em>, no solo para
                producción, y volver a desplegar.
              </p>
            </div>
          ) : (
          <>
          {aviso && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-amber-800/25 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
            >
              {aviso}
            </p>
          )}

          <FormularioAcceso volver={volver} />
          </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink/60">
          <Link href="/" className="hover:text-ink">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
