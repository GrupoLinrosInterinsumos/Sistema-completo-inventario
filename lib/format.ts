// fProduccion/fVencimiento are stored as UTC-midnight Date objects representing
// a calendar date only (no meaningful time-of-day), so formatting must pin to
// UTC — otherwise a negative local timezone offset shows the previous day.
export function formatFechaUTC(date: Date) {
  return date.toLocaleDateString("es-PE", { timeZone: "UTC" });
}

// Real timestamps (e.g. Ingreso.fecha, createdAt) reflect an actual instant,
// so display them in the warehouse's own timezone rather than the server's.
export function formatFechaLima(date: Date) {
  return date.toLocaleDateString("es-PE", { timeZone: "America/Lima" });
}

// YYYY-MM-DD bucket key for a timestamp in the warehouse's timezone.
export function fechaLimaISO(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

export function diaCortoLima(date: Date) {
  const label = date.toLocaleDateString("es-PE", { timeZone: "America/Lima", weekday: "short" });
  return label.charAt(0).toUpperCase() + label.slice(1, 3).replace(".", "");
}
