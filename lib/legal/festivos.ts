/**
 * Calendario judicial colombiano.
 *
 * Un término procesal se cuenta en días hábiles, y en Colombia eso no es
 * "de lunes a viernes": hay 18 festivos al año y solo seis caen en fecha
 * fija. Los otros doce se mueven, por dos motivos distintos:
 *
 * - La Ley 51 de 1983 (Ley Emiliani) traslada siete festivos al lunes
 *   siguiente cuando no caen en lunes.
 * - Cinco dependen de la Pascua, que cambia cada año.
 *
 * Por eso el calendario se calcula y no se escribe a mano: una tabla de
 * fechas fijas queda obsoleta cada 31 de diciembre, y un término mal
 * contado en un despacho no es un fallo cosmético.
 *
 * Todo se maneja en fechas UTC a mediodía. Guardar las fechas a las 00:00
 * es la forma clásica de que un huso horario negativo —Colombia es
 * UTC-5— desplace el día entero al anterior.
 */

/** Crea una fecha UTC al mediodía, a salvo de husos horarios. */
export function fecha(anio: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0));
}

/** 'YYYY-MM-DD' de una fecha, leída en UTC. */
export function aISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Convierte 'YYYY-MM-DD' en una fecha UTC al mediodía. */
export function desdeISO(iso: string): Date {
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return fecha(a, m, d);
}

function sumarDias(d: Date, dias: number): Date {
  return new Date(d.getTime() + dias * 86_400_000);
}

/**
 * Domingo de Pascua, por el algoritmo gregoriano anónimo
 * (Meeus/Jones/Butcher). De él cuelgan cinco de los festivos.
 */
export function domingoDePascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return fecha(anio, mes, dia);
}

/**
 * Traslada un festivo al lunes siguiente si no cae en lunes.
 * Es lo que hace la Ley Emiliani con siete de los dieciocho.
 */
function alLunesSiguiente(d: Date): Date {
  const diaSemana = d.getUTCDay(); // 0 domingo … 6 sábado
  if (diaSemana === 1) return d;
  return sumarDias(d, (8 - diaSemana) % 7);
}

/**
 * Los 18 festivos de un año, en 'YYYY-MM-DD'.
 *
 * Se memoriza por año: el cómputo de un plazo largo consulta el calendario
 * cientos de veces y no tiene sentido recalcular la Pascua en cada una.
 */
const cache = new Map<number, Set<string>>();

export function festivosDe(anio: number): Set<string> {
  const guardado = cache.get(anio);
  if (guardado) return guardado;

  const pascua = domingoDePascua(anio);

  const fijos = [
    fecha(anio, 1, 1), // Año Nuevo
    fecha(anio, 5, 1), // Día del Trabajo
    fecha(anio, 7, 20), // Independencia
    fecha(anio, 8, 7), // Batalla de Boyacá
    fecha(anio, 12, 8), // Inmaculada Concepción
    fecha(anio, 12, 25), // Navidad
  ];

  // Ley Emiliani: se celebran el lunes siguiente.
  const trasladables = [
    fecha(anio, 1, 6), // Reyes Magos
    fecha(anio, 3, 19), // San José
    fecha(anio, 6, 29), // San Pedro y San Pablo
    fecha(anio, 8, 15), // Asunción de la Virgen
    fecha(anio, 10, 12), // Día de la Raza
    fecha(anio, 11, 1), // Todos los Santos
    fecha(anio, 11, 11), // Independencia de Cartagena
  ].map(alLunesSiguiente);

  // Los de Semana Santa se celebran el día que caen; los tres posteriores
  // son jueves o viernes y la Ley Emiliani también los mueve al lunes.
  const dePascua = [
    sumarDias(pascua, -3), // Jueves Santo
    sumarDias(pascua, -2), // Viernes Santo
    sumarDias(pascua, 43), // Ascensión del Señor
    sumarDias(pascua, 64), // Corpus Christi
    sumarDias(pascua, 71), // Sagrado Corazón
  ];

  const todos = new Set(
    [...fijos, ...trasladables, ...dePascua].map(aISO),
  );
  cache.set(anio, todos);
  return todos;
}

export function esFestivo(d: Date): boolean {
  return festivosDe(d.getUTCFullYear()).has(aISO(d));
}

export function esFinDeSemana(d: Date): boolean {
  const s = d.getUTCDay();
  return s === 0 || s === 6;
}

/** Un día hábil judicial: ni fin de semana ni festivo. */
export function esHabil(d: Date): boolean {
  return !esFinDeSemana(d) && !esFestivo(d);
}

/** El siguiente día hábil, sin contar el de partida. */
export function siguienteHabil(d: Date): Date {
  let x = sumarDias(d, 1);
  while (!esHabil(x)) x = sumarDias(x, 1);
  return x;
}

/**
 * Suma días hábiles a una fecha.
 *
 * El día de partida no cuenta, que es como se cuentan los términos: un
 * plazo de tres días que empieza el lunes vence el jueves, no el
 * miércoles.
 */
export function sumarHabiles(desde: Date, dias: number): Date {
  let x = desde;
  for (let i = 0; i < dias; i += 1) x = siguienteHabil(x);
  return x;
}

/**
 * Días hábiles que faltan entre dos fechas.
 *
 * Negativo si la segunda ya pasó, y así el mismo número sirve para decir
 * "quedan 3" y "se pasó hace 2". Cero significa que vence hoy.
 */
export function habilesEntre(desde: Date, hasta: Date): number {
  const a = desdeISO(aISO(desde));
  const b = desdeISO(aISO(hasta));
  if (a.getTime() === b.getTime()) return 0;

  const haciaAdelante = b > a;
  const [inicio, fin] = haciaAdelante ? [a, b] : [b, a];

  let cuenta = 0;
  let x = inicio;
  while (x < fin) {
    x = sumarDias(x, 1);
    if (esHabil(x)) cuenta += 1;
  }
  return haciaAdelante ? cuenta : -cuenta;
}

/** Hoy, en la fecha de Colombia y no en la del servidor. */
export function hoyEnColombia(): Date {
  const ahora = new Date();
  // en-CA da 'YYYY-MM-DD', que es justo el formato que hace falta.
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
  return desdeISO(iso);
}

/**
 * Formatea un 'YYYY-MM-DD' para leerlo en pantalla.
 *
 * Se fuerza la zona UTC en el formateador, no la de Colombia. Parece al
 * revés, pero es lo correcto: la fecha ya se construyó al mediodía UTC
 * para representar un día concreto, y pedirle a Intl que la traduzca a
 * UTC-5 la correría al día anterior. Un vencimiento no tiene hora.
 */
export function fechaLegible(iso: string, conDiaSemana = false): string {
  return new Intl.DateTimeFormat("es-CO", {
    ...(conDiaSemana ? { weekday: "long" as const } : {}),
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(desdeISO(iso));
}

/** Versión corta: "07 sept 2026". */
export function fechaCortaISO(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(desdeISO(iso));
}
