import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { RackOcupacion } from "./rack-ocupacion";

export default async function ReporteUbicacionPage() {
  const [racks, stockRack, stockArea] = await Promise.all([
    prisma.rack.findMany({ orderBy: { numero: "asc" } }),
    prisma.ubicacionStock.findMany({
      where: { rackId: { not: null } },
      select: { id: true, nombreProducto: true, rackId: true, fila: true, columna: true },
    }),
    prisma.ubicacionStock.findMany({
      where: { areaLibre: { not: null } },
      select: { id: true, nombreProducto: true, areaLibre: true },
    }),
  ]);

  const porZona = new Map<string, { id: string; nombreProducto: string }[]>();
  for (const s of stockArea) {
    const zona = s.areaLibre ?? "";
    const lista = porZona.get(zona) ?? [];
    lista.push({ id: s.id, nombreProducto: s.nombreProducto });
    porZona.set(zona, lista);
  }
  const zonas = [...porZona.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="max-w-6xl">
      <p className="text-label-md uppercase tracking-wide text-on-surface-variant">
        <Link href="/ubicacion" className="hover:text-primary">
          Ubicación
        </Link>
      </p>
      <h1 className="mt-1 text-headline-md text-on-surface">Reporte de racks y zonas</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Qué hay en cada celda de cada rack y en cada zona libre, y cuáles están vacías.
      </p>

      <div className="mt-8 space-y-10">
        {racks.map((rack) => {
          const filaMinCode = rack.filaMin.charCodeAt(0);
          const filaMaxCode = rack.filaMax.charCodeAt(0);
          const totalCeldas = (filaMaxCode - filaMinCode + 1) * rack.columnas;

          const porCelda = new Map<string, { fila: string; columna: number; items: { id: string; nombreProducto: string }[] }>();
          for (const s of stockRack) {
            if (s.rackId !== rack.id || !s.fila || !s.columna) continue;
            const key = `${s.fila}${s.columna}`;
            const celda = porCelda.get(key) ?? { fila: s.fila, columna: s.columna, items: [] };
            celda.items.push({ id: s.id, nombreProducto: s.nombreProducto });
            porCelda.set(key, celda);
          }
          const celdas = [...porCelda.values()];
          const ocupadas = celdas.length;
          const vacias = totalCeldas - ocupadas;

          return (
            <div key={rack.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-headline-sm text-on-surface">Rack {rack.numero}</h2>
                <div className="flex gap-2">
                  <Badge variant="neutral">{ocupadas} ocupadas</Badge>
                  <Badge variant="success">{vacias} vacías</Badge>
                  <Badge variant="info">{totalCeldas} celdas</Badge>
                </div>
              </div>
              <div className="mt-3">
                <RackOcupacion
                  filaMin={rack.filaMin}
                  filaMax={rack.filaMax}
                  columnas={rack.columnas}
                  celdas={celdas}
                />
              </div>

              {celdas.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
                  <table className="min-w-full divide-y divide-outline-variant">
                    <thead className="bg-surface-container">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                          Celda
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">
                          Productos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {[...celdas]
                        .sort((a, b) => a.fila.localeCompare(b.fila) || a.columna - b.columna)
                        .map((celda) => (
                          <tr key={`${celda.fila}${celda.columna}`} className="align-top transition-colors hover:bg-surface-container">
                            <td className="whitespace-nowrap px-4 py-2 text-sm font-semibold text-on-surface">
                              {celda.fila}
                              {celda.columna}
                            </td>
                            <td className="px-4 py-2 text-sm text-on-surface-variant">
                              <div className="flex flex-wrap gap-1.5">
                                {celda.items.map((it) => (
                                  <Link
                                    key={it.id}
                                    href={`/ubicacion/${it.id}`}
                                    className="rounded-chip bg-surface-container px-2 py-1 text-xs text-on-surface transition-colors hover:bg-primary-fixed"
                                  >
                                    {it.nombreProducto}
                                  </Link>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-headline-sm text-on-surface">Zonas libres</h2>
          <Badge variant="neutral">
            {stockArea.length} producto{stockArea.length === 1 ? "" : "s"} en {zonas.length} zona
            {zonas.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="mt-3 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Zona</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Productos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {zonas.map(([zona, items]) => (
                <tr key={zona} className="align-top transition-colors hover:bg-surface-container">
                  <td className="whitespace-nowrap px-4 py-2 text-sm font-semibold text-on-surface">{zona}</td>
                  <td className="px-4 py-2 text-sm text-on-surface-variant">
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((it) => (
                        <Link
                          key={it.id}
                          href={`/ubicacion/${it.id}`}
                          className="rounded-chip bg-surface-container px-2 py-1 text-xs text-on-surface transition-colors hover:bg-primary-fixed"
                        >
                          {it.nombreProducto}
                        </Link>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {zonas.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    No hay productos en zonas libres.
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
