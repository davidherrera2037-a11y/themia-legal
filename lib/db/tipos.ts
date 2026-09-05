/**
 * Vocabulario del dominio: los valores que la base acepta y cómo se
 * escriben en pantalla.
 *
 * Antes cada pantalla llevaba su propia copia de estas listas. Cuando se
 * agregaba un estado había que acordarse de tocar tres archivos, y el que
 * se olvidara mostraba el código crudo ("WAITING_AUTHORITY") a la clienta.
 * Aquí hay un solo lugar, y los tipos salen de los mismos datos, así que
 * un valor mal escrito no compila.
 */

// ---------------------------------------------------------------- roles

export const ROLES = {
  SUPER_ADMIN: "Socia administradora",
  ADMINISTRATIVA: "Administrativa",
  ABOGADA: "Abogada",
  CLIENTE: "Clienta",
} as const;

export type Role = keyof typeof ROLES;

export const ROLES_EQUIPO = [
  "SUPER_ADMIN",
  "ADMINISTRATIVA",
  "ABOGADA",
] as const satisfies readonly Role[];

// ---------------------------------------------------------------- áreas

export const AREAS = {
  FAMILIA: "Derecho de familia",
  CIVIL: "Derecho civil",
  LABORAL: "Derecho laboral",
  COMERCIAL_EMPRESARIAL: "Derecho comercial y empresarial",
  CONSTITUCIONAL: "Derecho constitucional",
  PENAL: "Derecho penal",
  SERVICIOS_JURIDICOS: "Servicios jurídicos",
} as const;

export type Area = keyof typeof AREAS;

// ------------------------------------------------------- tipos de asunto

export const TIPOS_CASO = {
  CONSULTA: "Consulta",
  ASUNTO_EXTRAJUDICIAL: "Asunto extrajudicial",
  PROCESO_JUDICIAL: "Proceso judicial",
  TRAMITE_ADMINISTRATIVO: "Trámite administrativo",
  CONCILIACION: "Conciliación",
  CONTRATO: "Contrato",
  OTRO: "Otro",
} as const;

export type TipoCaso = keyof typeof TIPOS_CASO;

// ----------------------------------------------------------- prioridades

export const PRIORIDADES = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
} as const;

export type Prioridad = keyof typeof PRIORIDADES;

/** Tono visual de cada prioridad, para no repetir el mapa en cada tabla. */
export const TONO_PRIORIDAD: Record<Prioridad, "neutro" | "aviso" | "alerta"> = {
  BAJA: "neutro",
  MEDIA: "neutro",
  ALTA: "aviso",
  URGENTE: "alerta",
};

// --------------------------------------------------------- estados del caso

/**
 * Cada estado se escribe dos veces a propósito:
 *
 * - `equipo`: lenguaje de despacho, para la pantalla interna.
 * - `cliente`: lo que lee la clienta en su portal. Ni "WAITING_AUTHORITY"
 *   ni "Esperando a la autoridad" en seco — una frase que se entienda sin
 *   saber cómo funciona un juzgado.
 */
export const ESTADOS_CASO = {
  LEAD: {
    equipo: "Contacto inicial",
    cliente: "Registramos tu contacto inicial.",
  },
  CONSULTATION: {
    equipo: "En consulta",
    cliente: "Estamos en la etapa de consulta contigo.",
  },
  ANALYSIS: {
    equipo: "En análisis",
    cliente: "Estamos analizando tu caso.",
  },
  ACTIVE: {
    equipo: "Activo",
    cliente: "Tu caso está activo y lo estamos trabajando.",
  },
  WAITING_CLIENT: {
    equipo: "Esperando a la clienta",
    cliente: "Estamos esperando información de tu parte.",
  },
  WAITING_AUTHORITY: {
    equipo: "Esperando a la autoridad",
    cliente: "Estamos a la espera de respuesta de la autoridad.",
  },
  HEARING_SCHEDULED: {
    equipo: "Audiencia programada",
    cliente: "Tienes una audiencia programada.",
  },
  IN_PROGRESS: {
    equipo: "En trámite",
    cliente: "Tu proceso continúa en trámite.",
  },
  CLOSED: {
    equipo: "Cerrado",
    cliente: "Este caso está cerrado.",
  },
  ARCHIVED: {
    equipo: "Archivado",
    cliente: "Este caso está archivado.",
  },
} as const;

export type EstadoCaso = keyof typeof ESTADOS_CASO;

/**
 * Estados que cuentan como "trabajo en curso". Los usa el tablero para no
 * mezclar lo vivo con lo cerrado.
 */
export const ESTADOS_ABIERTOS = [
  "LEAD",
  "CONSULTATION",
  "ANALYSIS",
  "ACTIVE",
  "WAITING_CLIENT",
  "WAITING_AUTHORITY",
  "HEARING_SCHEDULED",
  "IN_PROGRESS",
] as const satisfies readonly EstadoCaso[];

export function estaAbierto(estado: string): boolean {
  return (ESTADOS_ABIERTOS as readonly string[]).includes(estado);
}

/** Estados en los que la pelota está del lado del despacho. */
export const ESTADOS_REQUIEREN_ACCION = [
  "LEAD",
  "CONSULTATION",
  "ANALYSIS",
] as const satisfies readonly EstadoCaso[];

// ----------------------------------------------------------- actuaciones

export const TIPOS_EVENTO = {
  NOTA: "Nota",
  ACTUACION: "Actuación",
  CAMBIO_ESTADO: "Cambio de estado",
  AUDIENCIA: "Audiencia",
  DOCUMENTO: "Documento",
  COMUNICACION: "Comunicación con la clienta",
} as const;

export type TipoEvento = keyof typeof TIPOS_EVENTO;

// ------------------------------------------------------------------ plazos

export const TIPOS_PLAZO = {
  TERMINO: "Término procesal",
  AUDIENCIA: "Audiencia",
  REUNION: "Reunión",
  PAGO: "Pago",
  OTRO: "Otro",
} as const;

export type TipoPlazo = keyof typeof TIPOS_PLAZO;

export const ESTADOS_PLAZO = {
  PENDIENTE: "Pendiente",
  CUMPLIDO: "Cumplido",
  CANCELADO: "Cancelado",
} as const;

export type EstadoPlazo = keyof typeof ESTADOS_PLAZO;

/**
 * Cómo de urgente es un plazo, según los días hábiles que le quedan.
 *
 * Los cortes están en días hábiles y no naturales a propósito: "vence en
 * 3 días" un viernes por la tarde significa el miércoles, no el lunes. El
 * semáforo tiene que contar como cuenta el juzgado.
 */
export type Urgencia = "vencido" | "hoy" | "inminente" | "proximo" | "holgado";

export function urgenciaDe(diasHabiles: number): Urgencia {
  if (diasHabiles < 0) return "vencido";
  if (diasHabiles === 0) return "hoy";
  if (diasHabiles <= 2) return "inminente";
  if (diasHabiles <= 5) return "proximo";
  return "holgado";
}

export const TONO_URGENCIA: Record<
  Urgencia,
  "alerta" | "aviso" | "oro" | "neutro"
> = {
  vencido: "alerta",
  hoy: "alerta",
  inminente: "aviso",
  proximo: "oro",
  holgado: "neutro",
};

/** Cómo se lee la cuenta atrás en pantalla. */
export function textoUrgencia(diasHabiles: number): string {
  if (diasHabiles === 0) return "Vence hoy";
  if (diasHabiles === 1) return "Vence mañana hábil";
  if (diasHabiles === -1) return "Venció hace 1 día hábil";
  if (diasHabiles < 0) return `Venció hace ${-diasHabiles} días hábiles`;
  return `Quedan ${diasHabiles} días hábiles`;
}

// -------------------------------------------------------------- documentos

export const TIPOS_DOCUMENTO_CASO = {
  DEMANDA: "Demanda",
  CONTESTACION: "Contestación",
  PODER: "Poder",
  PRUEBA: "Prueba",
  PROVIDENCIA: "Providencia o auto",
  CONTRATO: "Contrato",
  IDENTIFICACION: "Identificación",
  OTRO: "Otro",
} as const;

export type TipoDocumentoCaso = keyof typeof TIPOS_DOCUMENTO_CASO;

/** Tope de subida. El mismo que tiene el bucket, para no rechazar dos veces. */
export const TAMANO_MAXIMO = 20 * 1024 * 1024;

/**
 * Formatos admitidos, con su extensión visible.
 *
 * La lista es la misma que la del bucket. Está duplicada a propósito: la
 * de la base es la que manda, y esta solo sirve para dar un mensaje claro
 * antes de gastar la subida.
 */
export const FORMATOS_ADMITIDOS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/heic": "HEIC",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/plain": "TXT",
};

/** "1,4 MB" — para que el tamaño se lea, no se calcule. */
export function pesoLegible(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1).replace(".", ",")} MB`;
}

// -------------------------------------------------------------- clientas

export const TIPOS_DOCUMENTO = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  PASAPORTE: "Pasaporte",
  NIT: "NIT",
  OTRO: "Otro",
} as const;

export type TipoDocumento = keyof typeof TIPOS_DOCUMENTO;

// ------------------------------------------------------------ solicitudes

export const ESTADOS_LEAD = {
  NUEVA: "Nueva",
  CONTACTADA: "Contactada",
  AGENDADA: "Agendada",
  CONVERTIDA: "Convertida en clienta",
  DESCARTADA: "Descartada",
} as const;

export type EstadoLead = keyof typeof ESTADOS_LEAD;

// ---------------------------------------------------------------- utilidad

/**
 * Convierte un objeto de etiquetas en la lista de pares que necesita un
 * `<select>`, sin tener que escribirla otra vez a mano.
 */
export function opciones<T extends Record<string, string>>(
  mapa: T,
): { value: keyof T & string; label: string }[] {
  return Object.entries(mapa).map(([value, label]) => ({
    value: value as keyof T & string,
    label,
  }));
}

/** Fecha corta en español de Colombia, sin depender de la zona del servidor. */
export function fechaCorta(valor: string | Date | null | undefined): string {
  if (!valor) return "—";
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(fecha);
}

/** Fecha con hora, para la línea de tiempo del expediente. */
export function fechaHora(valor: string | Date | null | undefined): string {
  if (!valor) return "—";
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(fecha);
}
