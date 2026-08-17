export type Rol = "ALMACEN" | "SUPERVISOR";

export type NavIcon =
  | "dashboard"
  | "ingreso"
  | "desglose"
  | "buscar"
  | "stock"
  | "kardex"
  | "productos"
  | "usuarios"
  | "ubicacion";

export type Sistema = "almacen" | "ubicacion";

export const NAV_ITEMS: { href: string; label: string; roles: Rol[]; icon: NavIcon; sistema: Sistema }[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["SUPERVISOR"], icon: "dashboard", sistema: "almacen" },
  { href: "/ingresos", label: "Registro de Ingreso", roles: ["ALMACEN", "SUPERVISOR"], icon: "ingreso", sistema: "almacen" },
  { href: "/inventario", label: "Inventario (desglose)", roles: ["ALMACEN", "SUPERVISOR"], icon: "desglose", sistema: "almacen" },
  { href: "/stock/buscar", label: "Buscar / Retirar stock", roles: ["ALMACEN", "SUPERVISOR"], icon: "buscar", sistema: "almacen" },
  { href: "/stock", label: "Inventario Actual", roles: ["ALMACEN", "SUPERVISOR"], icon: "stock", sistema: "almacen" },
  { href: "/kardex", label: "Kardex", roles: ["SUPERVISOR"], icon: "kardex", sistema: "almacen" },
  { href: "/productos", label: "Catálogo de productos", roles: ["SUPERVISOR"], icon: "productos", sistema: "almacen" },
  { href: "/usuarios", label: "Usuarios", roles: ["SUPERVISOR"], icon: "usuarios", sistema: "almacen" },
  { href: "/ubicacion", label: "Buscar ubicación", roles: ["ALMACEN", "SUPERVISOR"], icon: "buscar", sistema: "ubicacion" },
  { href: "/ubicacion/ingreso", label: "Registrar ingreso", roles: ["ALMACEN", "SUPERVISOR"], icon: "ingreso", sistema: "ubicacion" },
];

export function sistemaDePathname(pathname: string): Sistema {
  return pathname.startsWith("/ubicacion") ? "ubicacion" : "almacen";
}
