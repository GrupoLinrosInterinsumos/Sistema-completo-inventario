import { prisma } from "@/lib/prisma";
import { labelUbicacion } from "@/lib/ubicacion";
import { estadoVencimiento } from "@/lib/vencimientos";
import { IconSearch } from "@/app/components/ui/icons";
import { Button } from "@/app/components/ui/button";
import { RetirarStock } from "../retirar-stock";
import { ResultsGrid } from "../results-grid";

export default async function BuscarStockPage({
  searchParams,
}: PageProps<"/stock/buscar">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const filas = q
    ? await prisma.inventarioActual.findMany({
        where: {
          cantidadDisponible: { gt: 0 },
          producto: {
            OR: [{ nombreSabor: { contains: q } }, { codigo: { contains: q } }],
          },
        },
        include: { producto: true, almacen: true },
        orderBy: [{ fVencimiento: "asc" }],
      })
    : [];

  const porAlmacen = new Map<string, typeof filas>();
  for (const fila of filas) {
    const key = fila.almacen.nombre;
    if (!porAlmacen.has(key)) porAlmacen.set(key, []);
    porAlmacen.get(key)!.push(fila);
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-headline-md text-on-surface">Buscar producto</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Encuentra en qué cajas hay stock disponible y retira cantidades. Ordenado por fecha de vencimiento más
        próxima.
      </p>

      <form method="get" className="mt-6 flex gap-3">
        <div className="relative w-full max-w-md">
          <IconSearch
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, SKU o lote..."
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {q && filas.length === 0 ? (
        <p className="mt-6 text-body-sm text-on-surface-variant">
          No se encontró stock disponible para &quot;{q}&quot;.
        </p>
      ) : null}

      {[...porAlmacen.entries()].map(([almacenNombre, filasAlmacen]) => (
        <div key={almacenNombre} className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-sm text-on-surface">Almacén {almacenNombre}</h2>
            <p className="text-xs text-on-surface-variant">
              Mostrando {filasAlmacen.length} resultado{filasAlmacen.length === 1 ? "" : "s"}
            </p>
          </div>

          <ResultsGrid>
            {filasAlmacen.map((fila) => (
              <RetirarStock
                key={fila.id}
                inventarioActualId={fila.id}
                nombreSabor={fila.producto.nombreSabor}
                ubicacionLabel={labelUbicacion(fila.almacen.tipoUbicacion)}
                ubicacionNumero={fila.ubicacionNumero}
                nCaja={fila.nCaja}
                lote={fila.lote}
                cantidadDisponible={fila.cantidadDisponible}
                unidad="kg"
                estado={estadoVencimiento(fila.fProduccion, fila.fVencimiento)}
              />
            ))}
          </ResultsGrid>
        </div>
      ))}
    </div>
  );
}
