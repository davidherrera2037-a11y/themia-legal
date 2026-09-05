import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SITIO, WHATSAPP_URL } from "@/lib/sitio";

const contacto = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: SITIO.telefono,
    href: WHATSAPP_URL,
  },
  {
    icon: Mail,
    label: "Correo electrónico",
    value: SITIO.correo,
    href: `mailto:${SITIO.correo}`,
  },
  {
    icon: MapPin,
    label: "Cobertura",
    value: "Toda Colombia, presencial y virtual",
  },
  {
    icon: Clock,
    label: "Respuesta",
    value: "Te contestamos en horario de oficina",
  },
];

export function ScheduleConsult() {
  return (
    <div
      id="agenda"
      className="reveal flex h-full flex-col rounded-3xl border border-gold/30 bg-cream-soft p-8 sm:p-10"
    >
      <span className="rotulo text-gold-deep">Contacto directo</span>
      <h2 className="mt-3 font-display text-2xl leading-snug text-ink">
        Agenda tu consulta
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/65">
        Si prefieres escribirnos tú, aquí tienes todos los caminos.
      </p>

      <ul className="mt-7 flex-1 space-y-5">
        {contacto.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-deep">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="rotulo block text-ink/45">{label}</span>
              {href ? (
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[15px] text-ink underline decoration-gold/40 underline-offset-4 transition-colors hover:decoration-gold"
                >
                  {value}
                </a>
              ) : (
                <span className="text-[15px] text-ink/85">{value}</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center gap-5 border-t border-ink/10 pt-7">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl border border-ink/10 bg-cream p-2.5 transition-transform hover:scale-[1.04]"
          aria-label="Abrir chat de WhatsApp con Themia Legal"
        >
          <QRCodeSVG
            value={WHATSAPP_URL}
            size={96}
            level="M"
            marginSize={0}
            fgColor="#221a16"
            bgColor="#fdf8f0"
            title="Código QR de WhatsApp de Themia Legal"
          />
        </a>
        <p className="text-sm leading-relaxed text-ink/65">
          Escanea el código y empieza la conversación por WhatsApp, sin
          formularios de por medio.
        </p>
      </div>
    </div>
  );
}
