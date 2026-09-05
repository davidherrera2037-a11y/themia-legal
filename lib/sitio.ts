/**
 * Datos del despacho en un solo sitio.
 *
 * El teléfono estaba escrito a mano en tres componentes y el correo en uno.
 * Cambiar de número obligaba a acordarse de todos; ahora es un archivo.
 * Además, los buscadores necesitan estos mismos datos en formato máquina
 * (ver el JSON-LD de la página principal) y así no pueden contradecirse.
 */

const URL_POR_DEFECTO = "https://themialegal.com";

export const SITIO = {
  nombre: "Themia Legal",
  nombreLargo: "Themia Legal — Firma de Abogadas",
  lema: "Derecho con propósito. Justicia con empatía.",
  descripcion:
    "Asesoría jurídica clara, humana y efectiva en Colombia. Familia, civil, laboral, comercial, constitucional y penal. Atención presencial y virtual.",

  // NEXT_PUBLIC_SITE_URL se define en Vercel. Sin ella, las etiquetas de
  // redes sociales apuntarían a rutas relativas y no mostrarían nada al
  // compartir el enlace.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? URL_POR_DEFECTO).replace(/\/$/, ""),

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
