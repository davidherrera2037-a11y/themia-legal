import { MessageCircle, Mail, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SITIO, WHATSAPP_URL } from "@/lib/sitio";

const contactLines = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: SITIO.telefono,
  },
  {
    icon: Mail,
    label: "Correo electrónico",
    value: SITIO.correo,
  },
  {
    icon: MapPin,
    label: "Atención en Colombia",
    value: "Presencial y virtual",
  },
];

export function ScheduleConsult() {
  return (
    <div
      id="agenda"
      className="reveal rounded-3xl bg-ink-deep px-8 py-10 text-cream sm:px-10"
    >
      <h2 className="font-display text-xl font-semibold tracking-wide text-gold-pale sm:text-2xl">
        Agenda tu consulta
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <ul className="space-y-4">
          {contactLines.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold text-gold">
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-wide text-cream/60">
                  {label}
                </span>
                <span className="text-[15px] text-cream/95">{value}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-3 justify-self-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-cream p-3 transition-transform hover:scale-[1.03]"
            aria-label="Abrir chat de WhatsApp con Themia Legal"
          >
            <QRCodeSVG
              value={WHATSAPP_URL}
              size={128}
              level="M"
              marginSize={0}
              fgColor="#221a16"
              bgColor="#fdf8f0"
              title="Código QR de WhatsApp de Themia Legal"
            />
          </a>
          <p className="max-w-[9.5rem] text-center text-xs leading-snug text-cream/70">
            Escanea este código para iniciar un chat de WhatsApp con Themia
            Legal.
          </p>
        </div>
      </div>
    </div>
  );
}
