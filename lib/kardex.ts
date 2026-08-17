import type { Prisma } from "@/app/generated/prisma/client";

export const TIPOS_MOVIMIENTO = ["INGRESO", "SALIDA", "AJUSTE", "ANULACION"] as const;
export type TipoMovimientoFiltro = (typeof TIPOS_MOVIMIENTO)[number];

export type KardexFiltros = {
  productoId?: string;
  almacenId?: string;
  usuarioId?: string;
  tipo?: TipoMovimientoFiltro;
  desde?: string;
  hasta?: string;
};

function leer(params: Record<string, string | string[] | undefined>, key: string) {
  const valor = params[key];
  return typeof valor === "string" && valor ? valor : undefined;
}

export function parseKardexFiltros(
  params: Record<string, string | string[] | undefined>
): KardexFiltros {
  const tipo = leer(params, "tipo");
  return {
    productoId: leer(params, "productoId"),
    almacenId: leer(params, "almacenId"),
    usuarioId: leer(params, "usuarioId"),
    tipo: TIPOS_MOVIMIENTO.includes(tipo as TipoMovimientoFiltro)
      ? (tipo as TipoMovimientoFiltro)
      : undefined,
    desde: leer(params, "desde"),
    hasta: leer(params, "hasta"),
  };
}

export function construirWhereKardex(filtros: KardexFiltros): Prisma.MovimientoWhereInput {
  const where: Prisma.MovimientoWhereInput = {};

  if (filtros.productoId) where.productoId = filtros.productoId;
  if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.almacenId) where.inventarioActual = { almacenId: filtros.almacenId };

  if (filtros.desde || filtros.hasta) {
    where.fechaHora = {};
    if (filtros.desde) where.fechaHora.gte = new Date(`${filtros.desde}T00:00:00`);
    if (filtros.hasta) where.fechaHora.lte = new Date(`${filtros.hasta}T23:59:59`);
  }

  return where;
}
