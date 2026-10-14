import { cookies } from "next/headers";

// Qué almacén (CRAMER/SACCO/FRACCIONAMIENTO) eligió el usuario en la pantalla
// "Sistemas Almacén" — se guarda en cookie para que el resto de páginas
// (Registro de Ingreso, Inventario, Buscar/Retirar stock, Inventario Actual)
// puedan restringirse a ese almacén sin pedir de nuevo en cada página. Solo
// aplica al rol ALMACEN: el SUPERVISOR siempre ve todo, sin importar esta cookie.
export const SISTEMA_ALMACEN_COOKIE = "sistema_almacen";

export const SISTEMAS_ALMACEN = ["CRAMER", "SACCO", "FRACCIONAMIENTO"] as const;
export type NombreAlmacenSistema = (typeof SISTEMAS_ALMACEN)[number];

export function esSistemaAlmacen(valor: string): valor is NombreAlmacenSistema {
  return (SISTEMAS_ALMACEN as readonly string[]).includes(valor);
}

export async function sistemaAlmacenActual(): Promise<NombreAlmacenSistema | null> {
  const store = await cookies();
  const valor = store.get(SISTEMA_ALMACEN_COOKIE)?.value ?? "";
  return esSistemaAlmacen(valor) ? valor : null;
}
