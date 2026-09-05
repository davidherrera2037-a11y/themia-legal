/**
 * Datos del despacho en un solo sitio.
 *
 * El teléfono estaba escrito a mano en tres componentes y el correo en uno.
 * Cambiar de número obligaba a acordarse de todos; ahora es un archivo.
 * Además, los buscadores necesitan estos mismos datos en formato máquina
 * (ver el JSON-LD de la página principal) y así no pueden contradecirse.
 */

/**
 * Dónde vive el sitio, por orden de preferencia.
 *
 * 1. NEXT_PUBLIC_SITE_URL, cuando se configura a mano (el dominio propio).
 * 2. El dominio de producción que Vercel expone solo. Sin esto, un
 *    despliegue sin configurar declaraba como canónica una dirección
 *    distinta de la suya, que es la forma más rápida de que un buscador
 *    deje de indexar el sitio.
 * 3. El dominio actual de Vercel, como último recurso.
 */
function resolverUrl(): string {
  const manual = process.env.NEXT_PUBLIC_SITE_URL;
  if (manual) return manual.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "https://themia-legal.vercel.app";
}

export const SITIO = {
  nombre: "Themia Legal",
  nombreLargo: "Themia Legal — Firma de Abogadas",
  lema: "Derecho con propósito. Justicia con empatía. Defensa con estrategia.",
  descripcion:
    "Asesoría jurídica clara, humana y efectiva en Colombia. Familia, civil, laboral, comercial, constitucional y penal. Atención presencial y virtual.",

  url: resolverUrl(),

  telefono: "313 330 0599",
  /** El mismo número en el formato que exige el enlace de WhatsApp. */
  telefonoInternacional: "573133300599",
  correo: "themia.legal@outlook.com",

  redes: {
    linkedin:
      "https://www.linkedin.com/in/themia-legal-7a1385425/?skipRedirect=true",
    instagram:
      "https://www.instagram.com/themia_legal?igsh=MWVvdDZ5OHU1NXdsdg%3D%3D&utm_source=qr",
    tiktok: "https://www.tiktok.com/@themia_legal?_r=1&_t=ZS-98O8aKg0q8n",
  },
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITIO.telefonoInternacional}`;
