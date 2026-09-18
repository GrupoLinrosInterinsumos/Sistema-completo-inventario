// <input type="date"> deja teclear años de 1 a 6 dígitos ("0228", "20266"), y
// sin validar se guardaban tal cual: un vencimiento en el año 228 aparecía
// como "-656933d", y un año de 5 dígitos dejaba la ficha en "Invalid Date" y
// rompía la pantalla de edición.
export const ANIO_MIN = 2000;
export const ANIO_MAX = 2100;

// Recibe "YYYY-MM-DD" (lo que entrega el input date) y devuelve la fecha a
// medianoche UTC, o null si no es una fecha real con año razonable.
export function parseFechaISO(valor: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < ANIO_MIN || year > ANIO_MAX) return null;
  const fecha = new Date(Date.UTC(year, month - 1, day));
  if (
    fecha.getUTCFullYear() !== year ||
    fecha.getUTCMonth() !== month - 1 ||
    fecha.getUTCDate() !== day
  ) {
    return null;
  }
  return fecha;
}

export function validarFechasIngreso(fProduccion: string, fVencimiento: string): string | null {
  const prod = parseFechaISO(fProduccion);
  const venc = parseFechaISO(fVencimiento);
  if (!prod) return `La fecha de producción no es válida (usa un año entre ${ANIO_MIN} y ${ANIO_MAX}).`;
  if (!venc) return `La fecha de vencimiento no es válida (usa un año entre ${ANIO_MIN} y ${ANIO_MAX}).`;
  if (venc.getTime() < prod.getTime()) {
    return "La fecha de vencimiento no puede ser anterior a la de producción.";
  }
  return null;
}

// Para precargar un <input type="date">: "" si la fecha guardada está dañada,
// en vez de reventar la página con toISOString().
export function fechaParaInput(fecha: Date): string {
  if (Number.isNaN(fecha.getTime())) return "";
  const year = fecha.getUTCFullYear();
  if (year < ANIO_MIN || year > ANIO_MAX) return "";
  return fecha.toISOString().slice(0, 10);
}
