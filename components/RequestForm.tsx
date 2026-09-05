"use client";

import { useActionState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Input, Select, Textarea, ErrorMsg } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { SIN_ESTADO } from "@/lib/acciones/tipos";
import { AREAS, opciones } from "@/lib/db/tipos";
import { enviarSolicitudAction } from "@/app/actions/leads";
import { SITIO, WHATSAPP_URL } from "@/lib/sitio";

// El desplegable público usa las mismas áreas que el resto del sistema, más
// "Otro". Antes era una lista suelta escrita a mano: cuando la solicitud se
// convertía en caso había que traducir el texto a mano al área real.
const OPCIONES_AREA = [
  ...opciones(AREAS),
  { value: "OTRO", label: "Otro / no estoy segura" },
];

function enlaceWhatsApp(datos: FormData | null) {
  if (!datos) return WHATSAPP_URL;
  const nombre = String(datos.get("full_name") ?? "").trim();
  const areaValor = String(datos.get("area") ?? "");
  const area =
    OPCIONES_AREA.find((o) => o.value === areaValor)?.label ?? "una consulta";
  const mensaje = String(datos.get("message") ?? "").trim();

  const lineas = [
    nombre ? `Hola, soy ${nombre}.` : "Hola.",
    `Quiero una consulta sobre: ${area}.`,
  ];
  if (mensaje) lineas.push(`Mi caso: ${mensaje}`);

  return `https://wa.me/${SITIO.telefonoInternacional}?text=${encodeURIComponent(lineas.join(" "))}`;
}

export function RequestForm() {
  const [estado, accion, pendiente] = useActionState<
    typeof SIN_ESTADO & { datos?: FormData },
    FormData
  >(async (previo, datos) => {
    const resultado = await enviarSolicitudAction(previo, datos);
    // Se guardan los datos enviados para poder armar el mensaje de WhatsApp
    // en el paso siguiente sin volver a pedirlos.
    return { ...resultado, datos };
  }, SIN_ESTADO);

  if (estado.ok) {
    return (
      <section id="solicitud" className="reveal bg-cream px-6 py-4 sm:px-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gold/40 bg-gold-pale/40 p-8 text-center sm:p-10">
          <CheckCircle2
            className="mx-auto h-10 w-10 text-gold"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
            Recibimos tu solicitud
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/75">
            Queda registrada en nuestro sistema, así que no se pierde. Si
            quieres adelantar, escríbenos ahora por WhatsApp con el mensaje ya
            preparado.
          </p>
          <a
            href={enlaceWhatsApp(estado.datos ?? null)}
            target="_blank"
            rel="noopener noreferrer"
            autoFocus
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink-deep"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Continuar por WhatsApp
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="solicitud" className="reveal bg-cream px-6 py-4 sm:px-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-cream-soft p-8 sm:p-10">
        <h2 className="text-center font-display text-2xl font-semibold text-ink sm:text-3xl">
          Cuéntanos tu caso
        </h2>
        <p className="mt-2 text-center text-sm text-ink/70">
          Déjanos tus datos y te escribimos para agendar tu consulta.
        </p>

        <form action={accion} className="mt-8 space-y-5">
          <ErrorMsg>{estado.error}</ErrorMsg>

          <Input
            name="full_name"
            label="Nombre"
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Tu nombre completo"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              name="phone"
              label="WhatsApp o teléfono"
              hint="(opcional)"
              type="tel"
              maxLength={40}
              autoComplete="tel"
              placeholder="300 000 0000"
            />
            <Input
              name="email"
              label="Correo"
              hint="(opcional)"
              type="email"
              maxLength={160}
              autoComplete="email"
            />
          </div>

          <Select
            name="area"
            label="Área de interés"
            required
            opciones={OPCIONES_AREA}
          />

          <Textarea
            name="message"
            label="Cuéntanos brevemente tu caso"
            hint="(opcional)"
            rows={4}
            maxLength={2000}
            placeholder="Un par de líneas nos ayudan a prepararnos antes de hablar contigo"
          />

          {/* Campo trampa para robots: invisible y fuera del recorrido de
              teclado, así que nadie que use la página llega a él. */}
          <div aria-hidden="true" className="hidden">
            <label htmlFor="website">No llenes este campo</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <SubmitButton className="w-full" pendiente="Enviando...">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Enviar solicitud
          </SubmitButton>

          <p className="text-center text-xs leading-relaxed text-ink/55">
            Al enviar autorizas que Themia Legal te contacte por este medio
            para atender tu consulta. Tus datos no se comparten con terceros.
          </p>
        </form>

        {/* Quien usa lector de pantalla no ve que el botón cambió de
            texto; esto se lo anuncia. */}
        <span className="sr-only" aria-live="polite">
          {pendiente ? "Enviando tu solicitud..." : ""}
        </span>
      </div>
    </section>
  );
}
