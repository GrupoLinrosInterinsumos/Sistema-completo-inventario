// En estos racks, vistos de frente en el almacén, la numeración arranca por el
// lado derecho: la columna 1 y las letras de las filas van a la derecha. El
// dibujo en pantalla se espeja para que coincida con lo que se ve físicamente.
// Para sumar otro rack basta con agregar su número.
export const RACKS_INVERTIDOS: readonly number[] = [2, 4, 6];

export function rackInvertido(numero: number | null | undefined) {
  return numero != null && RACKS_INVERTIDOS.includes(numero);
}
