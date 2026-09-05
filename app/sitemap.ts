import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  // Una sola página pública, con sus secciones dentro. Cuando haya
  // entradas de blog o páginas por área, se agregan aquí.
  return [
    {
      url: SITIO.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
