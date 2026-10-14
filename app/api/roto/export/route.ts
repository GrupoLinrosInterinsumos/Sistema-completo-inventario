import { NextRequest } from "next/server";
import { formatFechaLima } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { MOTIVO_LABEL, cantidadInicial, construirWhereRoto, parseRotoFiltros } from "@/lib/roto";
import { xlsxResponse } from "@/lib/xlsx";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const filtros = parseRotoFiltros(params);

  const registros = await prisma.productoDanado.findMany({
    where: construirWhereRoto(filtros),
    include: { usuario: true, consumos: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Fecha",
    "Producto",
    "Lote",
    "Motivo",
    "Cantidad inicial",
    "Consumido",
    "Disponible",
    "Unidad",
    "Ubicación",
    "Paleta / posición",
    "Observación",
    "Usuario",
  ];

  const rows = registros.map((r) => {
    const inicial = cantidadInicial(r.cantidad, r.consumos);
    return [
      formatFechaLima(r.createdAt),
      r.nombreProducto,
      r.lote ?? "",
      MOTIVO_LABEL[r.motivo],
      inicial,
      inicial - r.cantidad,
      r.cantidad,
      r.unidad,
      r.ubicacion,
      r.paleta ?? "",
      r.observacion ?? "",
      r.usuario.nombre,
    ];
  });

  return xlsxResponse("roto-nc.xlsx", "Roto - NC", headers, rows);
}
