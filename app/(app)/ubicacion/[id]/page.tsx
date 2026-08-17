import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
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
        Rack {item.rack.numero} — {item.fila}
        {item.columna}
      </p>

      <div className="mt-6">
        <RackVisual
          filaMin={item.rack.filaMin}
          filaMax={item.rack.filaMax}
          columnas={item.rack.columnas}
          filaResaltada={item.fila}
          columnaResaltada={item.columna}
        />
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
