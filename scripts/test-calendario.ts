/**
 * Pruebas del calendario judicial contra las fechas oficiales.
 *
 * No se comprueba "que el código haga lo que dice el código": se comparan
 * los 18 festivos calculados con los que realmente rigieron cada año. Si
 * el algoritmo de la Pascua o el traslado al lunes se rompen, esto lo
 * dice antes de que un término salga mal contado.
 *
 * Uso: npm test
 */
import {
  aISO,
  desdeISO,
  domingoDePascua,
  esHabil,
  festivosDe,
  habilesEntre,
  sumarHabiles,
} from "../lib/legal/festivos";

let fallos = 0;

function comprobar(nombre: string, real: unknown, esperado: unknown) {
  const a = JSON.stringify(real);
  const b = JSON.stringify(esperado);
  if (a === b) {
    console.log(`  ok  ${nombre}`);
  } else {
    fallos += 1;
    console.log(`  FALLA  ${nombre}\n         esperado: ${b}\n         obtenido: ${a}`);
  }
}

// ---------------------------------------------------------------- Pascua
console.log("\nDomingo de Pascua");
comprobar("2024", aISO(domingoDePascua(2024)), "2024-03-31");
comprobar("2025", aISO(domingoDePascua(2025)), "2025-04-20");
comprobar("2026", aISO(domingoDePascua(2026)), "2026-04-05");
comprobar("2027", aISO(domingoDePascua(2027)), "2027-03-28");

// -------------------------------------------------------------- Festivos
// Calendarios oficiales de Colombia.
const OFICIALES: Record<number, string[]> = {
  2024: [
    "2024-01-01", "2024-01-08", "2024-03-25", "2024-03-28", "2024-03-29",
    "2024-05-01", "2024-05-13", "2024-06-03", "2024-06-10", "2024-07-01",
    "2024-07-20", "2024-08-07", "2024-08-19", "2024-10-14", "2024-11-04",
    "2024-11-11", "2024-12-08", "2024-12-25",
  ],
  // 2025 tuvo 17 y no 18: San Pedro y San Pablo, trasladado, cayó el
  // mismo 30 de junio que el Sagrado Corazón.
  2025: [
    "2025-01-01", "2025-01-06", "2025-03-24", "2025-04-17", "2025-04-18",
    "2025-05-01", "2025-06-02", "2025-06-23", "2025-06-30", "2025-07-20",
    "2025-08-07", "2025-08-18", "2025-10-13", "2025-11-03", "2025-11-17",
    "2025-12-08", "2025-12-25",
  ],
  2026: [
    "2026-01-01", "2026-01-12", "2026-03-23", "2026-04-02", "2026-04-03",
    "2026-05-01", "2026-05-18", "2026-06-08", "2026-06-15", "2026-06-29",
    "2026-07-20", "2026-08-07", "2026-08-17", "2026-10-12", "2026-11-02",
    "2026-11-16", "2026-12-08", "2026-12-25",
  ],
};

for (const [anio, esperados] of Object.entries(OFICIALES)) {
  console.log(`\nFestivos de ${anio}`);
  const calculados = [...festivosDe(Number(anio))].sort();
  comprobar(`son ${esperados.length}`, calculados.length, esperados.length);
  comprobar("coinciden con el calendario oficial", calculados, esperados);
}

// ----------------------------------------------------------- Días hábiles
console.log("\nDías hábiles");
comprobar("un sábado no es hábil", esHabil(desdeISO("2026-09-05")), false);
comprobar("un domingo no es hábil", esHabil(desdeISO("2026-09-06")), false);
comprobar("un lunes normal sí", esHabil(desdeISO("2026-09-07")), true);
comprobar("Navidad no es hábil", esHabil(desdeISO("2026-12-25")), false);
comprobar(
  "el lunes de Reyes trasladado no es hábil",
  esHabil(desdeISO("2026-01-12")),
  false,
);
comprobar(
  "el 6 de enero de 2026, martes, SÍ es hábil (se trasladó)",
  esHabil(desdeISO("2026-01-06")),
  true,
);

// ------------------------------------------------------ Cómputo de términos
console.log("\nCómputo de términos");
// Viernes 4 de septiembre de 2026 + 3 hábiles => miércoles 9.
comprobar(
  "viernes + 3 hábiles salta el fin de semana",
  aISO(sumarHabiles(desdeISO("2026-09-04"), 3)),
  "2026-09-09",
);
// Jueves 31 de diciembre de 2026 + 1 hábil: el 1 de enero es festivo.
comprobar(
  "cruza el año saltándose el 1 de enero",
  aISO(sumarHabiles(desdeISO("2026-12-31"), 1)),
  "2027-01-04",
);
// Semana Santa 2026: miércoles 1 de abril + 2 hábiles. Jueves 2 y viernes
// 3 son festivos, así que cae el martes 7.
comprobar(
  "Semana Santa se descuenta entera",
  aISO(sumarHabiles(desdeISO("2026-04-01"), 2)),
  "2026-04-07",
);
comprobar(
  "el día de partida no cuenta",
  aISO(sumarHabiles(desdeISO("2026-09-07"), 1)),
  "2026-09-08",
);

console.log("\nDías que faltan");
comprobar("mismo día es cero", habilesEntre(desdeISO("2026-09-07"), desdeISO("2026-09-07")), 0);
comprobar(
  "de viernes a lunes falta uno",
  habilesEntre(desdeISO("2026-09-04"), desdeISO("2026-09-07")),
  1,
);
comprobar(
  "una fecha pasada da negativo",
  habilesEntre(desdeISO("2026-09-07"), desdeISO("2026-09-04")),
  -1,
);
comprobar(
  "sobre Semana Santa 2026 cuenta solo los hábiles",
  habilesEntre(desdeISO("2026-04-01"), desdeISO("2026-04-07")),
  2,
);

console.log(
  fallos === 0
    ? "\n✓ Todas las comprobaciones pasan.\n"
    : `\n✗ ${fallos} comprobación(es) fallan.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
