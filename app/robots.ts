import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El portal y la pantalla de acceso no tienen nada que hacer en un
      // buscador. Esto no es seguridad (RLS lo es), es higiene: que no
      // aparezcan direcciones internas al buscar el nombre del despacho.
      disallow: ["/portal", "/portal/", "/login"],
    },
    sitemap: `${SITIO.url}/sitemap.xml`,
  };
}
