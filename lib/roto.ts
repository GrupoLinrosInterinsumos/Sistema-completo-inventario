import type { Prisma } from "@/app/generated/prisma/client";
import { condicionesPorPalabraEnCampos } from "@/lib/search";

export const MOTIVOS_DANO = ["ROTO", "NC", "OBSERVADO", "MATERIAL"] as const;
export type MotivoDanoValor = (typeof MOTIVOS_DANO)[number];

export const MOTIVO_LABEL: Record<MotivoDanoValor, string> = {
  ROTO: "Roto",
  NC: "No conforme",
  OBSERVADO: "Observado",
  MATERIAL: "Material de almacén",
};

export const MOTIVO_VARIANT: Record<MotivoDanoValor, "danger" | "warning" | "info" | "neutral"> = {
  ROTO: "danger",
  NC: "warning",
  OBSERVADO: "info",
  MATERIAL: "neutral",
};

export function esMotivoDano(valor: string): valor is MotivoDanoValor {
  return (MOTIVOS_DANO as readonly string[]).includes(valor);
}

// "saldo" (por defecto) oculta lo ya consumido por completo.
export type EstadoRoto = "saldo" | "agotado" | "todos";

export type RotoFiltros = { q: string; motivo: string; estado: EstadoRoto };

export function parseRotoFiltros(params: Record<string, string | string[] | undefined>): RotoFiltros {
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const motivo = typeof params.motivo === "string" ? params.motivo : "";
  const estadoRaw = typeof params.estado === "string" ? params.estado : "";
  const estado: EstadoRoto = estadoRaw === "agotado" || estadoRaw === "todos" ? estadoRaw : "saldo";
  return { q, motivo, estado };
}

export function construirWhereRoto(f: RotoFiltros): Prisma.ProductoDanadoWhereInput {
  const where: Prisma.ProductoDanadoWhereInput = {};
  if (f.q) where.AND = condicionesPorPalabraEnCampos(["nombreProducto", "lote"], f.q);
  if (esMotivoDano(f.motivo)) where.motivo = f.motivo;
  if (f.estado === "saldo") where.cantidad = { gt: 0 };
  if (f.estado === "agotado") where.cantidad = { lte: 0 };
  return where;
}

// Cantidad que había al registrarlo = lo que queda + lo ya consumido.
export function cantidadInicial(disponible: number, consumos: { cantidad: number }[]) {
  return disponible + consumos.reduce((acc, c) => acc + c.cantidad, 0);
}

// "Pasillo 2 · Paleta 14" — la paleta es opcional.
export function ubicacionConPaleta(ubicacion: string, paleta: string | null) {
  return paleta ? `${ubicacion} · ${paleta}` : ubicacion;
}
