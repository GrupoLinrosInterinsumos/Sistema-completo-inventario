import { auth } from "@/auth";
import { formatFechaUTC } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabra } from "@/lib/search";
import { sistemaAlmacenActual } from "@/lib/sistema-almacen";
import { labelUbicacion } from "@/lib/ubicacion";
import { rangoProximosAVencer } from "@/lib/vencimientos";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { IconDownload } from "@/app/components/ui/icons";
import type { Prisma } from "@/app/generated/prisma/client";

export default async function InventarioActualPage({
  searchParams,
}: PageProps<"/stock">) {
  const params = await searchParams;
  const session = await auth();
  const sistema = session?.user.rol === "ALMACEN" ? await sistemaAlmacenActual() : null;
  const almacenId = sistema ? "" : typeof params.almacenId === "string" ? params.almacenId : "";
  const q = typeof params.q === "string" ? params.q : "";
  const vencePronto = params.vencePronto === "1";

  const where: Prisma.InventarioActualWhereInput = {};
  if (sistema) where.almacen = { nombre: sistema };
  else if (almacenId) where.almacenId = almacenId;
  if (q) {
    where.producto = {
      OR: [
        { AND: condicionesPorPalabra("nombreSabor", q) },
        { AND: condicionesPorPalabra("codigo", q) },
      ],
    };
  }
  if (vencePronto) {
    where.fVencimiento = rangoProximosAVencer();
  }

  const [filas, almacenesTodos] = await Promise.all([
    prisma.inventarioActual.findMany({
      where,
      include: { producto: true, almacen: true },
      orderBy: [{ fVencimiento: "asc" }],
    }),
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  const almacenes = sistema ? almacenesTodos.filter((a) => a.nombre === sistema) : almacenesTodos;

  const exportQuery = new URLSearchParams();
  if (almacenId) exportQuery.set("almacenId", almacenId);
  if (q) exportQuery.set("q", q);
  if (vencePronto) exportQuery.set("vencePronto", "1");
  const exportQueryString = exportQuery.toString();

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Inventario actual</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Stock consolidado en todas las cajas. Panel de control — para retirar mercadería usa el buscador.
          </p>
        </div>
        <a href={`/api/stock/export${exportQueryString ? `?${exportQueryString}` : ""}`}>
          <Button variant="outline">
            <IconDownload size={16} />
            Exportar a Excel
          </Button>
        </a>
      </div>

      <form method="get" className="mt-6 flex flex-col flex-wrap gap-4 rounded-card border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-end">
        <div className="w-full sm:w-auto">
          <label htmlFor="stock-almacen" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Almacén
          </label>
          {sistema ? (
            <p className="mt-1 py-1.5 text-sm font-medium text-on-surface">{sistema}</p>
          ) : (
            <select
              id="stock-almacen"
              name="almacenId"
              defaultValue={almacenId}
              className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
            >
              <option value="">Todos</option>
              {almacenes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="stock-q" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Producto
          </label>
          <input
            id="stock-q"
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Nombre o código"
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-on-surface sm:pb-2">
          <input type="checkbox" name="vencePronto" value="1" defaultChecked={vencePronto} />
          Próximos a vencer (30 días)
        </label>

        <Button type="submit">Filtrar</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Almacén</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Ubicación</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Caja</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Producto</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Lote</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Vencimiento</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Cantidad</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filas.map((fila) => (
              <tr className="transition-colors hover:bg-surface-container" key={fila.id}>
                <td className="px-4 py-2 text-sm text-on-surface">{fila.almacen.nombre}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {labelUbicacion(fila.almacen.tipoUbicacion)} {fila.ubicacionNumero}
                </td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{fila.nCaja}</td>
                <td className="px-4 py-2 text-sm text-on-surface">{fila.producto.nombreSabor}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{fila.lote}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{formatFechaUTC(fila.fVencimiento)}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{fila.cantidadDisponible}</td>
                <td className="px-4 py-2 text-sm">
                  {fila.cantidadDisponible <= 0 ? (
                    <Badge variant="neutral">Vacía</Badge>
                  ) : (
                    <Badge variant="success">Disponible</Badge>
                  )}
                </td>
              </tr>
            ))}
            {filas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  No hay stock que coincida con los filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
