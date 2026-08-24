import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { labelUbicacion } from "@/lib/ubicacion";
import { condicionesPorPalabra } from "@/lib/search";
import { sistemaAlmacenActual } from "@/lib/sistema-almacen";
import { camaraFisica, puertasDeCamaraFisica } from "@/lib/sacco-refrigeradoras";
import { estadoVencimiento } from "@/lib/vencimientos";
import { Suspense } from "react";
import { LiveSearch } from "@/app/components/ui/live-search";
import { RetirarStock } from "../retirar-stock";
import { ResultsGrid } from "../results-grid";
import type { Prisma } from "@/app/generated/prisma/client";

export default async function BuscarStockPage({
  searchParams,
}: PageProps<"/stock/buscar">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const session = await auth();
  const sistema = session?.user.rol === "ALMACEN" ? await sistemaAlmacenActual() : null;

  const where: Prisma.InventarioActualWhereInput = {
    cantidadDisponible: { gt: 0 },
    producto: {
      OR: [
        { AND: condicionesPorPalabra("nombreSabor", q) },
        { AND: condicionesPorPalabra("codigo", q) },
      ],
    },
  };
  if (sistema) where.almacen = { nombre: sistema };

  const filas = q
    ? await prisma.inventarioActual.findMany({
        where,
        include: { producto: true, almacen: true },
        orderBy: [{ fVencimiento: "asc" }],
      })
    : [];

  // Todas las cajas vivas en las mismas ubicaciones que los resultados, para
  // poder mostrar "qué más hay en esta paleta/refrigeradora" sin N+1 queries.
  // En SACCO, algunas "cámaras" son en realidad la misma refrigeradora física
  // con 2 puertas (CC1+CC2, CC3+CC4) — se agrupan por cámara física, no por
  // puerta, para que los hermanos no se corten a mitad de cámara.
  const clavesUbicacion = [...new Set(filas.map((f) => `${f.almacenId}|${camaraFisica(f.ubicacionNumero)}`))];
  const hermanosPorClave = new Map<string, { nCaja: string; nombreSabor: string }[]>();
  if (clavesUbicacion.length > 0) {
    const todasLasCajas = await prisma.inventarioActual.findMany({
      where: {
        cantidadDisponible: { gt: 0 },
        OR: clavesUbicacion.map((clave) => {
          const [almacenId, camara] = clave.split("|");
          return { almacenId, ubicacionNumero: { in: puertasDeCamaraFisica(camara) } };
        }),
      },
      select: { almacenId: true, ubicacionNumero: true, nCaja: true, producto: { select: { nombreSabor: true } } },
    });
    for (const c of todasLasCajas) {
      const clave = `${c.almacenId}|${camaraFisica(c.ubicacionNumero)}`;
      const lista = hermanosPorClave.get(clave) ?? [];
      lista.push({ nCaja: c.nCaja, nombreSabor: c.producto.nombreSabor });
      hermanosPorClave.set(clave, lista);
    }
  }

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

      <div className="mt-6">
        <Suspense fallback={<div className="h-11 w-full max-w-md rounded-md bg-surface-container-low" />}>
          <LiveSearch placeholder="Buscar por nombre, SKU o lote..." />
        </Suspense>
      </div>

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
                hermanos={hermanosPorClave.get(`${fila.almacenId}|${camaraFisica(fila.ubicacionNumero)}`) ?? []}
              />
            ))}
          </ResultsGrid>
        </div>
      ))}
    </div>
  );
}
