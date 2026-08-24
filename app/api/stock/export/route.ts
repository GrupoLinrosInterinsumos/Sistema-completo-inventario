import { NextRequest } from "next/server";
import { formatFechaUTC } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabraEnCampos } from "@/lib/search";
import { labelUbicacion } from "@/lib/ubicacion";
import { rangoProximosAVencer } from "@/lib/vencimientos";
import { xlsxResponse } from "@/lib/xlsx";
import type { Prisma } from "@/app/generated/prisma/client";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const almacenId = typeof params.almacenId === "string" ? params.almacenId : "";
  const q = typeof params.q === "string" ? params.q : "";
  const vencePronto = params.vencePronto === "1";

  const where: Prisma.InventarioActualWhereInput = {};
  if (almacenId) where.almacenId = almacenId;
  if (q) {
    where.producto = { AND: condicionesPorPalabraEnCampos(["nombreSabor", "codigo"], q) };
  }
  if (vencePronto) {
    where.fVencimiento = rangoProximosAVencer();
  }

  const filas = await prisma.inventarioActual.findMany({
    where,
    include: { producto: true, almacen: true },
    orderBy: [{ fVencimiento: "asc" }],
  });

  const headers = [
    "Almacén",
    "Ubicación",
    "Caja",
    "Producto",
    "Código",
    "Lote",
    "F. Vencimiento",
    "Cantidad disponible",
    "Estado",
  ];

  const rows = filas.map((fila) => [
    fila.almacen.nombre,
    `${labelUbicacion(fila.almacen.tipoUbicacion)} ${fila.ubicacionNumero}`,
    fila.nCaja,
    fila.producto.nombreSabor,
    fila.producto.codigo,
    fila.lote,
    formatFechaUTC(fila.fVencimiento),
    fila.cantidadDisponible,
    fila.cantidadDisponible <= 0 ? "Vacía" : "Disponible",
  ]);

  return xlsxResponse("inventario-actual.xlsx", "Inventario Actual", headers, rows);
}
