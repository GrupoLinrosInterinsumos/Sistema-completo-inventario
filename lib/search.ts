const databaseUrl = process.env.DATABASE_URL ?? "";
const esPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

// SQLite ya compara `contains` sin distinguir mayúsculas/minúsculas (para
// ASCII) y no acepta el argumento `mode`; Postgres sí lo distingue y sí
// necesita `mode: "insensitive"` explícito. Se agrega solo cuando aplica.
function filtroContains(palabra: string) {
  return esPostgres ? { contains: palabra, mode: "insensitive" as const } : { contains: palabra };
}

// Búsqueda "inteligente": ignora mayúsculas/minúsculas y no exige que las
// palabras aparezcan en el mismo orden — "esencia piña" encuentra
// "ESENCIA PIÑA TURBIA" igual que "piña esencia".
export function condicionesPorPalabra(campo: string, q: string) {
  const palabras = q.trim().split(/\s+/).filter(Boolean);
  return palabras.map((palabra) => ({
    [campo]: filtroContains(palabra),
  }));
}

// Igual que arriba, pero cada palabra puede coincidir en cualquiera de varios
// campos (ej. nombre o código) — útil cuando el buscador cubre más de una columna.
export function condicionesPorPalabraEnCampos(campos: string[], q: string) {
  const palabras = q.trim().split(/\s+/).filter(Boolean);
  return palabras.map((palabra) => ({
    OR: campos.map((campo) => ({ [campo]: filtroContains(palabra) })),
  }));
}
