import { LinkedinIcon, InstagramIcon, TiktokIcon } from "./SocialIcons";
import { SITIO } from "@/lib/sitio";

const SOCIALS = [
  { label: "LinkedIn", href: SITIO.redes.linkedin, Icon: LinkedinIcon },
  { label: "Instagram", href: SITIO.redes.instagram, Icon: InstagramIcon },
  { label: "TikTok", href: SITIO.redes.tiktok, Icon: TiktokIcon },
];

export function Footer() {
  return (
    <footer className="reveal bg-cream px-6 pb-16 pt-4 text-center sm:px-10">
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-center gap-3 text-gold">
        <span className="h-px flex-1 bg-gold/40" aria-hidden="true" />
        <p className="text-xs font-semibold tracking-[0.2em]">
          DERECHO CON PROPÓSITO &middot; JUSTICIA CON EMPATÍA
        </p>
        <span className="h-px flex-1 bg-gold/40" aria-hidden="true" />
      </div>

      <p className="text-balance mx-auto max-w-2xl font-display text-lg leading-relaxed text-ink sm:text-xl">
        Con mucho orgullo les presento en qué estamos trabajando en Themia
        Legal. ⚖️
        <br />
        Estos son nuestros servicios y estamos listas para acompañarte 🤎
      </p>

      <div className="mx-auto mt-8 flex max-w-6xl items-center justify-center gap-4">
        {SOCIALS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-ink/10 pt-6 text-xs text-ink/55">
        <p>
          © {new Date().getFullYear()} {SITIO.nombre}. {SITIO.telefono} ·{" "}
          {SITIO.correo}
        </p>
        <p className="mt-1">
          La información de este sitio es divulgativa y no constituye asesoría
          jurídica; cada caso requiere estudio particular.
        </p>
      </div>
    </footer>
  );
}
