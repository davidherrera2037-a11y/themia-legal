import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, Vacio } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WHATSAPP_URL } from "@/lib/sitio";
import {
  AREAS,
  ESTADOS_CASO,
  fechaCorta,
  type Area,
  type EstadoCaso,
} from "@/lib/db/tipos";

export default async function ClientePage() {
  const profile = await requireRole(["CLIENTE"]);

  const supabase = await createClient();
  // RLS ya limita esto a los casos de esta persona: aunque la consulta no
  // lleve ningún filtro, la base solo devuelve las filas cuyo cliente está
  // vinculado a su cuenta.
  const { data: casos } = await supabase
    .from("cases")
    .select("id, title, area, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Hola{profile.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Aquí puedes seguir en qué va cada uno de tus asuntos.
        </p>
      </div>

      <Card>
        <CardTitle hint={casos?.length ? `${casos.length} en total` : undefined}>
          Tus asuntos
        </CardTitle>

        <div className="mt-4">
          {!casos || casos.length === 0 ? (
            <Vacio>
              Todavía no tienes asuntos asociados a tu cuenta. Si acabas de
              registrarte, tu abogada los va a vincular en breve.
            </Vacio>
          ) : (
            <ul className="space-y-3">
              {casos.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/portal/cliente/${c.id}`}
                    className="block rounded-2xl border border-ink/10 bg-cream px-4 py-4 transition-colors hover:border-ink/25"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <span className="text-sm font-medium text-ink">
                        {c.title}
                      </span>
                      <Badge tono="oro">
                        {AREAS[c.area as Area] ?? c.area}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/75">
                      {ESTADOS_CASO[c.status as EstadoCaso]?.cliente ??
                        "Tu proceso continúa en trámite."}
                    </p>
                    <p className="mt-2 text-xs text-ink/50">
                      Última actualización: {fechaCorta(c.updated_at)} · ver
                      detalle →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>¿Necesitas hablar con nosotras?</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-ink/75">
          Escríbenos por WhatsApp y te respondemos en horario de oficina. Si
          es urgente, dilo en el primer mensaje.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Escribir por WhatsApp
        </a>
      </Card>
    </div>
  );
}
