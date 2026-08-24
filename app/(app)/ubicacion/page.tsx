import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabra } from "@/lib/search";
import { labelUbicacion } from "@/lib/ubicacion";
import { Badge } from "@/app/components/ui/badge";
import { Card } from "@/app/components/ui/card";
import { LinkButton } from "@/app/components/ui/link-button";
import { LiveSearch } from "@/app/components/ui/live-search";
import { IconPlus } from "@/app/components/ui/icons";
import { ResultsGrid } from "../stock/results-grid";

type ResultadoUnificado = {
  id: string;
  nombreProducto: string;
  ubicacion: string;
  href: string;
  origen: "CRAMER" | "SACCO" | "UBICACION";
};

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
          orderBy: { ordenIngreso: "asc" },
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

  const resultados: ResultadoUnificado[] = [
    ...ubicaciones.map((r) => ({
      id: r.id,
      nombreProducto: r.nombreProducto,
      ubicacion: r.rack ? `Rack ${r.rack.numero} — ${r.fila}${r.columna}` : (r.areaLibre ?? ""),
      href: `/ubicacion/${r.id}`,
      origen: "UBICACION" as const,
    })),
    ...stockCramerSacco.map((f) => ({
      id: f.id,
      nombreProducto: f.producto.nombreSabor,
      ubicacion: `${labelUbicacion(f.almacen.tipoUbicacion)} ${f.ubicacionNumero} / Caja ${f.nCaja}`,
      href: `/ubicacion/stock/${f.id}`,
      origen: f.almacen.nombre as "CRAMER" | "SACCO",
    })),
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Ubicación</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Busca un producto para ver en qué rack está. Ordenado por el lote que llegó primero.
          </p>
        </div>
        <LinkButton href="/ubicacion/ingreso">
          <IconPlus size={16} />
          Registrar ingreso
        </LinkButton>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div className="h-11 w-full max-w-md rounded-md bg-surface-container-low" />}>
          <LiveSearch placeholder="Busca un producto..." />
        </Suspense>
      </div>

      {q && resultados.length === 0 ? (
        <p className="mt-6 text-body-sm text-on-surface-variant">
          No se encontró ninguna ubicación para &quot;{q}&quot;.
        </p>
      ) : null}

      {resultados.length > 0 ? (
        <div className="mt-8">
          <ResultsGrid>
            {resultados.map((r) => (
              <Link key={`${r.origen}-${r.id}`} href={r.href}>
                <Card className="p-4 transition-transform hover:scale-[1.01]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-on-surface">{r.nombreProducto}</h3>
                    <Badge variant={r.origen === "UBICACION" ? "info" : "neutral"}>{r.origen}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{r.ubicacion}</p>
                </Card>
              </Link>
            ))}
          </ResultsGrid>
        </div>
      ) : null}
    </div>
  );
}
