import { NextRequest } from "next/server";
import { formatFechaLima } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabra } from "@/lib/search";
import { xlsxResponse } from "@/lib/xlsx";
import type { Prisma } from "@/app/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const q = typeof params.q === "string" ? params.q : "";
  const motivo = typeof params.motivo === "string" ? params.motivo : "";

  const where: Prisma.ProductoDanadoWhereInput = {};
  if (q) where.AND = condicionesPorPalabra("nombreProducto", q);
  if (motivo === "ROTO" || motivo === "NC") where.motivo = motivo;

  const registros = await prisma.productoDanado.findMany({
    where,
    include: { usuario: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Fecha", "Producto", "Motivo", "Cantidad", "Unidad", "Ubicación", "Observación", "Usuario"];

  const rows = registros.map((r) => [
    formatFechaLima(r.createdAt),
    r.nombreProducto,
    r.motivo,
    r.cantidad,
    r.unidad,
    r.ubicacion,
    r.observacion ?? "",
    r.usuario.nombre,
  ]);

  return xlsxResponse("roto-nc.xlsx", "Roto - NC", headers, rows);
}
