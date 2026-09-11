// Cramer usa "N° Paleta"; Sacco usa "N° Slot de refrigeradora". En la base de
// datos es el mismo campo (ubicacionNumero); solo cambia la etiqueta según
// el tipo de ubicación del almacén.
export function labelUbicacion(tipoUbicacion: "PALETA" | "SLOT") {
  return tipoUbicacion === "PALETA" ? "N° Paleta" : "N° Slot de refrigeradora";
}

// Filas antiguas de Ubicación solo tienen "ordenIngreso" (un YYYYMMDD que en
// su momento se derivó de la fecha de vencimiento del conteo original); las
// nuevas ya guardan fVencimiento directo. Esto da una fecha comparable para
// ordenar ambas por igual, sin importar cuándo se cargaron.
export function fechaEfectivaUbicacion(item: { fVencimiento: Date | null; ordenIngreso: number | null }): number {
  if (item.fVencimiento) return item.fVencimiento.getTime();
  if (item.ordenIngreso) {
    const s = String(item.ordenIngreso);
    if (s.length === 8) {
      const year = Number(s.slice(0, 4));
      const month = Number(s.slice(4, 6));
      const day = Number(s.slice(6, 8));
      const fecha = new Date(Date.UTC(year, month - 1, day));
      if (!Number.isNaN(fecha.getTime())) return fecha.getTime();
    }
  }
  return Number.POSITIVE_INFINITY;
}
