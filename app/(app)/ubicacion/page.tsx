import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { condicionesPorPalabra } from "@/lib/search";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconPlus, IconSearch } from "@/app/components/ui/icons";
import { ResultsGrid } from "../stock/results-grid";

export default async function UbicacionPage({
  searchParams,
}: PageProps<"/ubicacion">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const resultados = q
    ? await prisma.ubicacionStock.findMany({
        where: { AND: condicionesPorPalabra("nombreProducto", q) },
        include: { rack: true },
        orderBy: { ordenIngreso: "asc" },
      })
    : [];

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
            placeholder="Busca un producto..."
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      {q && resultados.length === 0 ? (
        <p className="mt-6 text-body-sm text-on-surface-variant">
          No se encontró ninguna ubicación para &quot;{q}&quot;.
        </p>
      ) : null}

      {resultados.length > 0 ? (
        <div className="mt-8">
          <ResultsGrid>
            {resultados.map((r) => (
              <Link key={r.id} href={`/ubicacion/${r.id}`}>
                <Card className="p-4 transition-transform hover:scale-[1.01]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-on-surface">{r.nombreProducto}</h3>
                    <Badge variant="info">N° {r.ordenIngreso}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {r.rack ? `Rack ${r.rack.numero} — ${r.fila}${r.columna}` : r.areaLibre}
                  </p>
                </Card>
              </Link>
            ))}
          </ResultsGrid>
        </div>
      ) : null}
    </div>
  );
}
