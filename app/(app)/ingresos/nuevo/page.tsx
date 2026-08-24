import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sistemaAlmacenActual } from "@/lib/sistema-almacen";
import { IngresoForm } from "../ingreso-form";

export default async function NuevoIngresoPage() {
  const session = await auth();
  const sistema = session?.user.rol === "ALMACEN" ? await sistemaAlmacenActual() : null;

  const [almacenesTodos, productos] = await Promise.all([
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ where: { activo: true }, orderBy: { nombreSabor: "asc" } }),
  ]);

  const almacenes = sistema ? almacenesTodos.filter((a) => a.nombre === sistema) : almacenesTodos;

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
