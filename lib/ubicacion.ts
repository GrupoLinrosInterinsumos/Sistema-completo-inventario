// Cramer usa "N° Paleta"; Sacco usa "N° Slot de refrigeradora". En la base de
// datos es el mismo campo (ubicacionNumero); solo cambia la etiqueta según
// el tipo de ubicación del almacén.
export function labelUbicacion(tipoUbicacion: "PALETA" | "SLOT") {
  return tipoUbicacion === "PALETA" ? "N° Paleta" : "N° Slot de refrigeradora";
}
