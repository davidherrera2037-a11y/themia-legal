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

const topRow: PracticeArea[] = [
  {
    title: "DERECHO DE FAMILIA",
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
    title: "DERECHO CIVIL",
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
    title: "DERECHO LABORAL",
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
    title: "DERECHO COMERCIAL Y EMPRESARIAL",
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
    title: "DERECHO CONSTITUCIONAL",
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
    title: "DERECHO PENAL",
    icon: Gavel,
    items: [
      "Asesoría durante denuncias",
      "Acompañamiento en audiencias",
      "Representación de víctimas e indiciados",
      "Conceptos jurídicos",
    ],
  },
  {
    title: "SERVICIOS JURÍDICOS",
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
  return (
    <section className="bg-cream px-6 py-16 sm:px-10 sm:py-20" id="areas">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {topRow.map((area) => (
            <PracticeAreaCard key={area.title} {...area} />
          ))}
        </div>

        <div className="my-12 h-px w-full bg-ink/15" aria-hidden="true" />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {bottomRow.map((area) => (
            <PracticeAreaCard key={area.title} {...area} />
          ))}
        </div>
      </div>
    </section>
  );
}
