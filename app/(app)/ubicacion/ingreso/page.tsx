import { prisma } from "@/lib/prisma";
import { UbicacionIngresoForm } from "../ingreso-form";

export default async function UbicacionIngresoPage() {
  const [racks, ocupadasRaw, ubicacionNombres, productos] = await Promise.all([
    prisma.rack.findMany({ orderBy: { numero: "asc" } }),
    prisma.ubicacionStock.findMany({
      where: { rackId: { not: null } },
      select: { rackId: true, fila: true, columna: true, nombreProducto: true },
    }),
    prisma.ubicacionStock.findMany({ select: { nombreProducto: true }, distinct: ["nombreProducto"] }),
    prisma.producto.findMany({ select: { nombreSabor: true }, distinct: ["nombreSabor"] }),
  ]);

  const ocupadas = ocupadasRaw as { rackId: string; fila: string; columna: number; nombreProducto: string }[];
  const nombresSugeridos = [
    ...new Set([...ubicacionNombres.map((u) => u.nombreProducto), ...productos.map((p) => p.nombreSabor)]),
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline-md text-on-surface">Registrar ingreso</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Elige el rack y haz clic en la celda libre donde va el producto.
      </p>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <UbicacionIngresoForm racks={racks} ocupadas={ocupadas} nombresSugeridos={nombresSugeridos} />
      </div>
    </div>
  );
}
