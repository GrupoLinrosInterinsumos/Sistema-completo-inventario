import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabra } from "@/lib/search";
import { fechaEfectivaUbicacion, labelUbicacion } from "@/lib/ubicacion";
import { LinkButton } from "@/app/components/ui/link-button";
import { LiveSearch } from "@/app/components/ui/live-search";
import { IconClipboardCheck, IconPlus } from "@/app/components/ui/icons";
import { ResultadosLista, type ResultadoUnificado } from "./resultados-lista";

export default async function UbicacionPage({
  searchParams,
}: PageProps<"/ubicacion">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  // Búsqueda unificada: un producto puede estar en un rack/zona de Ubicación
  // O en el stock propio de CRAMER/SACCO (paletas/refrigeradoras) — se
  // buscan las dos fuentes a la vez para que "encontrar dónde está" cubra
  // todo lo que se ha cargado, sin importar el sistema.
  const [ubicaciones, stockCramerSacco] = q
    ? await Promise.all([
        prisma.ubicacionStock.findMany({
          where: { AND: condicionesPorPalabra("nombreProducto", q) },
          include: { rack: true },
        }),
        prisma.inventarioActual.findMany({
          where: {
            cantidadDisponible: { gt: 0 },
            producto: {
              OR: [
                { AND: condicionesPorPalabra("nombreSabor", q) },
                { AND: condicionesPorPalabra("codigo", q) },
              ],
            },
          },
          include: { producto: true, almacen: true },
          orderBy: { fVencimiento: "asc" },
        }),
      ])
    : [[], []];

  const qParam = q ? `?q=${encodeURIComponent(q)}` : "";
  const resultados: (ResultadoUnificado & { fechaOrden: number })[] = [
    ...ubicaciones.map((r) => ({
      id: r.id,
      nombreProducto: r.nombreProducto,
      ubicacion: r.rack ? `Rack ${r.rack.numero} — ${r.fila}${r.columna}` : (r.areaLibre ?? ""),
      href: `/ubicacion/${r.id}${qParam}`,
      origen: "UBICACION" as const,
      fechaOrden: fechaEfectivaUbicacion(r),
    })),
    ...stockCramerSacco.map((f) => ({
      id: f.id,
      nombreProducto: f.producto.nombreSabor,
      ubicacion: `${labelUbicacion(f.almacen.tipoUbicacion)} ${f.ubicacionNumero} / Caja ${f.nCaja}`,
      href: `/ubicacion/stock/${f.id}${qParam}`,
      origen: f.almacen.nombre as "CRAMER" | "SACCO",
      fechaOrden: f.fVencimiento.getTime(),
    })),
  ];

  // Ubicación "NC" (no consta) es una posición sin registrar — se manda al
  // final en vez de mezclarse con resultados que sí tienen dónde está. El
  // resto se ordena por la fecha de vencimiento más próxima (o su
  // equivalente para filas antiguas que solo tienen N° de ingreso).
  const sinUbicacionClara = (u: string) => u.trim().toUpperCase() === "NC";
  resultados.sort((a, b) => {
    const aSinUbic = Number(sinUbicacionClara(a.ubicacion));
    const bSinUbic = Number(sinUbicacionClara(b.ubicacion));
    if (aSinUbic !== bSinUbic) return aSinUbic - bSinUbic;
    return a.fechaOrden - b.fechaOrden;
  });

  const sugerencias = [...new Set(resultados.map((r) => r.nombreProducto))];

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Ubicación</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Busca un producto para ver en qué rack está. Ordenado por el lote que llegó primero.
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/ubicacion/reporte" variant="outline">
            <IconClipboardCheck size={16} />
            Reporte de racks y zonas
          </LinkButton>
          <LinkButton href="/ubicacion/ingreso">
            <IconPlus size={16} />
            Registrar ingreso
          </LinkButton>
        </div>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div className="h-11 w-full max-w-md rounded-md bg-surface-container-low" />}>
          <LiveSearch placeholder="Busca un producto..." sugerencias={sugerencias} />
        </Suspense>
      </div>

      {q && resultados.length === 0 ? (
        <p className="mt-6 text-body-sm text-on-surface-variant">
          No se encontró ninguna ubicación para &quot;{q}&quot;.
        </p>
      ) : null}

      {resultados.length > 0 ? <ResultadosLista resultados={resultados} /> : null}
    </div>
  );
}
