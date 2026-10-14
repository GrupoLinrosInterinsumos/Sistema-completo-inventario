// Listas fijas pedidas por el equipo para que cada quien no escriba los
// nombres "a su manera": se eligen de una lista en vez de teclearse.
// Para agregar o quitar una opción basta con editar estas listas.

export const NOMBRES_PRODUCTO_FIJOS = [
  "Producto cramer",
  "Producto fraccionado",
  "Producto no conforme",
  "Producto observado",
  "Producto abierto (puchos)",
  "Materiales de almacén",
] as const;

export const ZONAS_FIJAS = [
  "Pasillo 1",
  "Pasillo 2",
  "Pasillo 3",
  "Pasillo 4",
  "Zona de despacho",
  "Campo libre 1",
  "Campo libre 2",
  "Campo libre 3",
] as const;

export function esZonaFija(nombre: string) {
  return (ZONAS_FIJAS as readonly string[]).includes(nombre);
}
