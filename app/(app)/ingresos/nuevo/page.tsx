import { prisma } from "@/lib/prisma";
import { IngresoForm } from "../ingreso-form";

export default async function NuevoIngresoPage() {
  const [almacenes, productos] = await Promise.all([
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ where: { activo: true }, orderBy: { nombreSabor: "asc" } }),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-headline-md text-on-surface">Nuevo registro de ingreso</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        La fecha y el N° de hoja se asignan automáticamente al guardar.
      </p>

      <div className="mt-6">
        <IngresoForm almacenes={almacenes} productos={productos} mode="crear" />
      </div>
    </div>
  );
}
