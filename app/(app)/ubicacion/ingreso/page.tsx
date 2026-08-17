import { prisma } from "@/lib/prisma";
import { UbicacionIngresoForm } from "../ingreso-form";

export default async function UbicacionIngresoPage() {
  const [racks, ocupadas] = await Promise.all([
    prisma.rack.findMany({ orderBy: { numero: "asc" } }),
    prisma.ubicacionStock.findMany({
      select: { rackId: true, fila: true, columna: true, nombreProducto: true },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline-md text-on-surface">Registrar ingreso</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Elige el rack y haz clic en la celda libre donde va el producto.
      </p>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <UbicacionIngresoForm racks={racks} ocupadas={ocupadas} />
      </div>
    </div>
  );
}
