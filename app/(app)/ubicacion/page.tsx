import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabra } from "@/lib/search";
import { formatFechaUTC } from "@/lib/format";
import { fechaDesdeOrdenIngreso, fechaEfectivaUbicacion } from "@/lib/ubicacion";
import { LiveSearch } from "@/app/components/ui/live-search";
import { ResultadosLista, type ResultadoUbicacion } from "./resultados-lista";
import { DeshacerToast } from "./deshacer-toast";

const comparar = (a: string, b: string) => a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });

export default async function UbicacionPage({
  searchParams,
}: PageProps<"/ubicacion">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  // Solo lo que está en el módulo de Ubicación (racks y zonas): el stock de
  // CRAMER, SACCO y Fraccionamiento se consulta en sus propios módulos.
  const ubicaciones = q
    ? await prisma.ubicacionStock.findMany({
        where: { AND: condicionesPorPalabra("nombreProducto", q) },
        include: { rack: true },
      })
    : [];

  const qParam = q ? `?q=${encodeURIComponent(q)}` : "";
  const resultados: (ResultadoUbicacion & { fechaOrden: number })[] = ubicaciones.map((r) => ({
    id: r.id,
    nombreProducto: r.nombreProducto,
    ubicacion: r.rack ? `Rack ${r.rack.numero} — ${r.fila}${r.columna}` : (r.areaLibre ?? ""),
    href: `/ubicacion/${r.id}${qParam}`,
    fechaOrden: fechaEfectivaUbicacion(r),
    lote: r.lote,
    vencimiento: r.fVencimiento
      ? formatFechaUTC(r.fVencimiento)
      : (() => {
          const fecha = fechaDesdeOrdenIngreso(r.ordenIngreso);
          return fecha ? formatFechaUTC(fecha) : null;
        })(),
  }));

  // Ubicación "NC" (no consta) es una posición sin registrar — se manda al
  // final. El resto va primero por fecha de vencimiento (o su equivalente
  // para filas antiguas que solo tienen N° de ingreso) y, a igual
  // vencimiento, por correlativo de lote (A605012 antes que A605014); lo que
  // no tiene lote queda después de lo que sí. Por último, por ubicación.
  const sinUbicacionClara = (u: string) => u.trim().toUpperCase() === "NC";
  resultados.sort((a, b) => {
    const aSinUbic = Number(sinUbicacionClara(a.ubicacion));
    const bSinUbic = Number(sinUbicacionClara(b.ubicacion));
    if (aSinUbic !== bSinUbic) return aSinUbic - bSinUbic;
    if (a.fechaOrden !== b.fechaOrden) return a.fechaOrden - b.fechaOrden;
    if (!a.lote !== !b.lote) return a.lote ? -1 : 1;
    if (a.lote && b.lote) {
      const porLote = comparar(a.lote, b.lote);
      if (porLote !== 0) return porLote;
    }
    return comparar(a.ubicacion, b.ubicacion);
  });

  const sugerencias = [...new Set(resultados.map((r) => r.nombreProducto))];

  return (
    <div className="max-w-6xl">
      <DeshacerToast />
      <div>
        <h1 className="text-headline-md text-on-surface">Ubicación</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Busca un producto para ver en qué rack o zona está. Ordenado por fecha de vencimiento y, a igual
          vencimiento, por lote.
        </p>
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
