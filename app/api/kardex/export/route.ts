import { NextRequest } from "next/server";
import { formatFechaLima } from "@/lib/format";
import { construirWhereKardex, parseKardexFiltros } from "@/lib/kardex";
import { prisma } from "@/lib/prisma";
import { labelUbicacion } from "@/lib/ubicacion";
import { xlsxResponse } from "@/lib/xlsx";

const TIPO_LABEL: Record<string, string> = {
  INGRESO: "Ingreso",
  SALIDA: "Salida",
  AJUSTE: "Ajuste",
  ANULACION: "Anulación",
};

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const filtros = parseKardexFiltros(params);
  const where = construirWhereKardex(filtros);

  const movimientos = await prisma.movimiento.findMany({
    where,
    include: { producto: true, usuario: true, inventarioActual: { include: { almacen: true } } },
    orderBy: { fechaHora: "desc" },
  });

  const headers = [
    "Fecha",
    "Tipo",
    "Producto",
    "Código",
    "Almacén",
    "Ubicación",
    "Caja",
    "Lote",
    "Cantidad (kg)",
    "Usuario",
    "Referencia / Motivo",
  ];

  const rows = movimientos.map((m) => [
    formatFechaLima(m.fechaHora),
    TIPO_LABEL[m.tipo] ?? m.tipo,
    m.producto.nombreSabor,
    m.producto.codigo,
    m.inventarioActual?.almacen.nombre ?? "",
    m.inventarioActual
      ? `${labelUbicacion(m.inventarioActual.almacen.tipoUbicacion)} ${m.inventarioActual.ubicacionNumero}`
      : "",
    m.inventarioActual?.nCaja ?? "",
    m.inventarioActual?.lote ?? "",
    m.cantidad,
    m.usuario.nombre,
    m.referencia ?? m.observacion ?? "",
  ]);

  return xlsxResponse("kardex.xlsx", "Kardex", headers, rows);
}
