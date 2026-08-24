import { cookies } from "next/headers";

// Qué almacén (CRAMER/SACCO) eligió el usuario en la pantalla "Sistemas
// Almacén" — se guarda en cookie para que el resto de páginas (Registro de
// Ingreso, Inventario, Buscar/Retirar stock, Inventario Actual) puedan
// restringirse a ese almacén sin pedir de nuevo en cada página. Solo aplica
// al rol ALMACEN: el SUPERVISOR siempre ve todo, sin importar esta cookie.
export const SISTEMA_ALMACEN_COOKIE = "sistema_almacen";

export type NombreAlmacenSistema = "CRAMER" | "SACCO";

export async function sistemaAlmacenActual(): Promise<NombreAlmacenSistema | null> {
  const store = await cookies();
  const valor = store.get(SISTEMA_ALMACEN_COOKIE)?.value;
  return valor === "CRAMER" || valor === "SACCO" ? valor : null;
}
