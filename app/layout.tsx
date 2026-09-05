import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lora } from "next/font/google";
import { SITIO } from "@/lib/sitio";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  // Sin metadataBase, las direcciones de las imágenes para compartir salen
  // relativas y ni WhatsApp ni LinkedIn muestran nada al pegar el enlace.
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} | Firma de Abogadas`,
    template: `%s | ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  keywords: [
    "abogadas Colombia",
    "derecho de familia",
    "divorcio",
    "cuota alimentaria",
    "acción de tutela",
    "derecho laboral",
    "asesoría jurídica virtual",
  ],
  authors: [{ name: SITIO.nombre }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITIO.url,
    siteName: SITIO.nombre,
    title: SITIO.nombreLargo,
    description: SITIO.descripcion,
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: SITIO.lema,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITIO.nombreLargo,
    description: SITIO.descripcion,
    images: ["/images/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf8f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
