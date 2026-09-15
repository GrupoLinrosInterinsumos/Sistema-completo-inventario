// Cramer usa "N° Paleta"; Sacco usa "N° Slot de refrigeradora". En la base de
// datos es el mismo campo (ubicacionNumero); solo cambia la etiqueta según
// el tipo de ubicación del almacén.
export function labelUbicacion(tipoUbicacion: "PALETA" | "SLOT") {
  return tipoUbicacion === "PALETA" ? "N° Paleta" : "N° Slot de refrigeradora";
}

// Filas antiguas de Ubicación solo tienen "ordenIngreso" (un YYYYMMDD que en
// su momento se derivó de la fecha de vencimiento del conteo original); las
// nuevas ya guardan fVencimiento directo. Se usa para mostrar esa fecha (no
// solo para ordenar) porque sigue siendo la fecha de vencimiento real, aunque
// esas filas no tengan lote cargado.
export function fechaDesdeOrdenIngreso(ordenIngreso: number | null): Date | null {
  if (!ordenIngreso) return null;
  const s = String(ordenIngreso);
  if (s.length !== 8) return null;
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(4, 6));
  const day = Number(s.slice(6, 8));
  const fecha = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

// Da una fecha comparable para ordenar filas nuevas y antiguas por igual, sin
// importar cuándo se cargaron.
export function fechaEfectivaUbicacion(item: { fVencimiento: Date | null; ordenIngreso: number | null }): number {
  if (item.fVencimiento) return item.fVencimiento.getTime();
  const fecha = fechaDesdeOrdenIngreso(item.ordenIngreso);
  return fecha ? fecha.getTime() : Number.POSITIVE_INFINITY;
}
