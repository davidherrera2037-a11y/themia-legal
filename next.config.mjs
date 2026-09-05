/**
 * Cabeceras de seguridad del sitio.
 *
 * El navegador solo activa estas defensas si el servidor se las pide, y
 * hasta ahora no se pedía ninguna. Aquí se declaran una sola vez para
 * todas las rutas.
 *
 * La Content-Security-Policy NO está aquí: cambia según la ruta (el área
 * privada lleva un número de un solo uso en cada petición) y este archivo
 * solo sirve para cabeceras fijas. Vive en proxy.ts.
 */
const CABECERAS = [
  // Sin esto, cualquier sitio puede meter el portal en un iframe invisible
  // y hacer que alguien del equipo pulse botones creyendo que hace otra
  // cosa. X-Frame-Options cubre a los navegadores viejos que aún no leen
  // la directiva equivalente de la CSP.
  { key: "X-Frame-Options", value: "DENY" },

  // Evita que el navegador "adivine" el tipo de un archivo servido y
  // termine ejecutando como script algo que se subió como documento.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Que la URL completa no viaje a sitios ajenos: las rutas del portal
  // llevan identificadores de casos y de clientas.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // El sitio no usa cámara, micrófono ni ubicación. Declararlo cierra esas
  // puertas para cualquier script que llegara a colarse.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },

  // Obliga a HTTPS durante dos años, subdominios incluidos. Vercel ya sirve
  // solo por HTTPS; esto evita el primer salto en claro de quien escriba la
  // dirección a mano.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Los documentos del expediente se suben por una acción de
      // servidor, y el tope por defecto de Next es 1 MB: no admite ni una
      // demanda escaneada. Se sube a 20 MB, el mismo tope que tiene el
      // bucket, para que el archivo no se rechace en dos sitios distintos
      // con dos mensajes distintos.
      bodySizeLimit: "20mb",
    },
  },
  // No anunciar el framework: no cierra ningún agujero, pero le ahorra al
  // atacante saber contra qué está.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: CABECERAS }];
  },
};

export default nextConfig;
