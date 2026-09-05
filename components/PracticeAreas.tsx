import {
  Users,
  FileText,
  Briefcase,
  TrendingUp,
  Scale,
  Gavel,
  ClipboardList,
} from "lucide-react";
import { PracticeAreaCard, type PracticeArea } from "./PracticeAreaCard";
import { SectionHeading } from "./ui/SectionHeading";

const topRow: PracticeArea[] = [
  {
    title: "Derecho de familia",
    slug: "familia",
    icon: Users,
    items: [
      "Divorcios y separación de bienes",
      "Cuota alimentaria",
      "Custodia y visitas",
      "Unión marital de hecho",
      "Sucesiones y herencias",
    ],
  },
  {
    title: "Derecho civil",
    slug: "civil",
    icon: FileText,
    items: [
      "Contratos (elaboración y revisión)",
      "Cobro de deudas",
      "Arrendamientos",
      "Responsabilidad civil",
      "Compraventa de bienes",
    ],
  },
  {
    title: "Derecho laboral",
    slug: "laboral",
    icon: Briefcase,
    items: [
      "Despidos injustificados",
      "Prestaciones sociales",
      "Acuerdos laborales",
      "Liquidaciones",
      "Asesoría a empleados y empleadores",
    ],
  },
  {
    title: "Derecho comercial y empresarial",
    slug: "comercial-empresarial",
    icon: TrendingUp,
    items: [
      "Constitución de empresa",
      "Contratos comerciales",
      "Registro de marcas",
      "Asesoría para emprendimientos y negocios",
    ],
  },
];

const bottomRow: PracticeArea[] = [
  {
    title: "Derecho constitucional",
    slug: "constitucional",
    icon: Scale,
    items: [
      "Acciones de tutela",
      "Protección de derechos fundamentales",
      "Derecho a la salud",
      "Derecho a la educación",
      "Habeas Data",
    ],
  },
  {
    title: "Derecho penal",
    slug: "penal",
    icon: Gavel,
    items: [
      "Asesoría durante denuncias",
      "Acompañamiento en audiencias",
      "Representación de víctimas e indiciados",
      "Conceptos jurídicos",
    ],
  },
  {
    title: "Servicios jurídicos",
    slug: "servicios-juridicos",
    icon: ClipboardList,
    items: [
      "Elaboración de contratos",
      "Derechos de petición",
      "Acciones de tutela",
      "Recursos",
      "Conceptos jurídicos",
      "Revisión de documentos",
      "Consultoría preventiva",
    ],
  },
];

export function PracticeAreas() {
  // Las dos filas del diseño original se unen en un solo catálogo: con
  // tarjetas, la retícula ya separa visualmente y el corte a mitad solo
  // obligaba a decidir arbitrariamente qué área iba "arriba".
  const areas = [...topRow, ...bottomRow];

  return (
    <section id="areas" className="px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="reveal">
          <SectionHeading
            numero="01"
            rotulo="Áreas de práctica"
            titulo="En qué podemos acompañarte"
            entradilla="Cada asunto se estudia en particular. Si el tuyo no encaja
              exactamente en ninguna de estas casillas, escríbenos igual y te
              decimos con franqueza si podemos ayudarte."
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, i) => (
            <PracticeAreaCard
              key={area.slug}
              {...area}
              numero={String(i + 1).padStart(2, "0")}
              // Escalonado por columna, no por posición absoluta: así la
              // fila entra como una onda y no como una escalera larga.
              retraso={(i % 3) * 90}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
