import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { IconPackage } from "@/app/components/ui/icons";
import { RackVisual } from "../rack-visual";
import { marcarVacioAction } from "../actions";

export default async function UbicacionDetallePage({
  params,
}: PageProps<"/ubicacion/[id]">) {
  const { id } = await params;

  const item = await prisma.ubicacionStock.findUnique({
    where: { id },
    include: { rack: true },
  });

  if (!item) notFound();

  return (
    <div className="max-w-3xl">
      <p className="text-label-md uppercase tracking-wide text-on-surface-variant">
        <Link href="/ubicacion" className="hover:text-primary">
          Ubicación
        </Link>
      </p>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-md text-on-surface">{item.nombreProducto}</h1>
        <Badge variant="info">N° de ingreso {item.ordenIngreso}</Badge>
      </div>

      <p className="mt-1 text-body-sm text-on-surface-variant">
        {item.rack ? `Rack ${item.rack.numero} — ${item.fila}${item.columna}` : item.areaLibre}
      </p>

      <div className="mt-6">
        {item.rack && item.fila && item.columna ? (
          <RackVisual
            filaMin={item.rack.filaMin}
            filaMax={item.rack.filaMax}
            columnas={item.rack.columnas}
            filaResaltada={item.fila}
            columnaResaltada={item.columna}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-card border border-outline-variant bg-surface-container-lowest p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <IconPackage size={28} />
            </span>
            <p className="text-headline-sm text-on-surface">{item.areaLibre}</p>
            <p className="text-sm text-on-surface-variant">
              Zona sin rack asignado — no tiene una celda específica.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/ubicacion">
          <Button variant="outline">Volver</Button>
        </Link>
        <form action={marcarVacioAction.bind(null, item.id)}>
          <Button type="submit" variant="danger">
            Está Vacío
          </Button>
        </form>
      </div>
    </div>
  );
}
