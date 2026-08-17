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

export const NAV_ITEMS: { href: string; label: string; roles: Rol[]; icon: NavIcon }[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["SUPERVISOR"], icon: "dashboard" },
  { href: "/ingresos", label: "Registro de Ingreso", roles: ["ALMACEN", "SUPERVISOR"], icon: "ingreso" },
  { href: "/inventario", label: "Inventario (desglose)", roles: ["ALMACEN", "SUPERVISOR"], icon: "desglose" },
  { href: "/stock/buscar", label: "Buscar / Retirar stock", roles: ["ALMACEN", "SUPERVISOR"], icon: "buscar" },
  { href: "/stock", label: "Inventario Actual", roles: ["ALMACEN", "SUPERVISOR"], icon: "stock" },
  { href: "/ubicacion", label: "Ubicación", roles: ["ALMACEN", "SUPERVISOR"], icon: "ubicacion" },
  { href: "/kardex", label: "Kardex", roles: ["SUPERVISOR"], icon: "kardex" },
  { href: "/productos", label: "Catálogo de productos", roles: ["SUPERVISOR"], icon: "productos" },
  { href: "/usuarios", label: "Usuarios", roles: ["SUPERVISOR"], icon: "usuarios" },
];
