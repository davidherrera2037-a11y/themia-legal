import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { PracticeAreas } from "@/components/PracticeAreas";
import { RequestForm } from "@/components/RequestForm";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ScheduleConsult } from "@/components/ScheduleConsult";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITIO } from "@/lib/sitio";
import { AREAS } from "@/lib/db/tipos";

/**
 * Ficha del despacho en el formato que leen los buscadores.
 *
 * Es lo que hace que al buscar "Themia Legal" salga el teléfono, el horario
 * y las áreas en el propio resultado, en vez de solo un enlace azul. Los
 * datos salen de lib/sitio.ts, así que no pueden contradecir a los que se
 * muestran en pantalla.
 */
const FICHA_NEGOCIO = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: SITIO.nombre,
  alternateName: SITIO.nombreLargo,
  description: SITIO.descripcion,
  slogan: SITIO.lema,
  url: SITIO.url,
  image: `${SITIO.url}/images/hero.jpg`,
  telephone: `+${SITIO.telefonoInternacional}`,
  email: SITIO.correo,
  areaServed: { "@type": "Country", name: "Colombia" },
  availableLanguage: "es",
  sameAs: [SITIO.redes.linkedin, SITIO.redes.instagram, SITIO.redes.tiktok],
  knowsAbout: Object.values(AREAS),
};

export default function LandingPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // El contenido es un objeto propio, no texto de nadie de fuera.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FICHA_NEGOCIO) }}
      />
      <ScrollReveal />
      <Header />
      <Hero />
      <IntroSection />
      <PracticeAreas />
      <WhyChooseUs />

      <section id="solicitud" className="px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="reveal">
            <SectionHeading
              centrado
              numero="03"
              rotulo="Hablemos"
              titulo="El primer paso es una conversación"
              entradilla="Cuéntanos por encima qué te pasa. Sin compromiso y sin
                lenguaje de abogados: te decimos con franqueza si podemos
                ayudarte y cómo."
            />
          </div>

          {/* Las dos vías —dejar los datos o escribir directamente— van a
              la misma altura a propósito: ninguna es la secundaria. */}
          <div className="mt-14 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            <RequestForm />
            <ScheduleConsult />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
