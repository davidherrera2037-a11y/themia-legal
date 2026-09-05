import { LinkedinIcon, InstagramIcon, TiktokIcon } from "./SocialIcons";
import { LogoMark } from "./Logo";
import { SITIO, WHATSAPP_URL } from "@/lib/sitio";

const SOCIALS = [
  { label: "LinkedIn", href: SITIO.redes.linkedin, Icon: LinkedinIcon },
  { label: "Instagram", href: SITIO.redes.instagram, Icon: InstagramIcon },
  { label: "TikTok", href: SITIO.redes.tiktok, Icon: TiktokIcon },
];

const AREAS = [
  ["Derecho de familia", "#familia"],
  ["Derecho civil", "#civil"],
  ["Derecho laboral", "#laboral"],
  ["Derecho comercial y empresarial", "#comercial-empresarial"],
  ["Derecho constitucional", "#constitucional"],
  ["Derecho penal", "#penal"],
  ["Servicios jurídicos", "#servicios-juridicos"],
];

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream-deep/50 px-6 pb-10 pt-16 sm:px-10">
      <div className="reveal mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-11 w-auto text-gold" />
              <div>
                <p className="font-display text-lg font-semibold tracking-[0.06em] text-ink">
                  THEMIA LEGAL
                </p>
                <p className="rotulo mt-1 text-ink/55">Firma de abogadas</p>
              </div>
            </div>
            <p className="medida mt-5 font-display text-base italic leading-relaxed text-ink/75">
              Derecho con propósito. Justicia con empatía.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-all hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-cream"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-labelledby="pie-areas">
            <h2 id="pie-areas" className="rotulo text-ink/45">
              Áreas de práctica
            </h2>
            <ul className="mt-4 space-y-2">
              {AREAS.map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm text-ink/75 transition-colors hover:text-gold-deep"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="rotulo text-ink/45">Contacto</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink/75">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold-deep"
                >
                  WhatsApp {SITIO.telefono}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITIO.correo}`}
                  className="break-all transition-colors hover:text-gold-deep"
                >
                  {SITIO.correo}
                </a>
              </li>
              <li>Presencial y virtual en Colombia</li>
              <li className="pt-2">
                <a
                  href="/login"
                  className="rotulo text-ink/50 transition-colors hover:text-ink"
                >
                  Portal privado
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ink/10 pt-7 text-xs leading-relaxed text-ink/50 sm:flex-row sm:items-baseline sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITIO.nombre}. Todos los derechos
            reservados.
          </p>
          <p className="medida sm:text-right">
            La información de este sitio es divulgativa y no constituye
            asesoría jurídica; cada caso requiere estudio particular.
          </p>
        </div>
      </div>
    </footer>
  );
}
