import { prisma } from "@/lib/prisma";
import { UbicacionIngresoForm } from "../ingreso-form";

export default async function UbicacionIngresoPage() {
  const racks = await prisma.rack.findMany({ orderBy: { numero: "asc" } });

  return (
    <div className="max-w-md">
      <h1 className="text-headline-md text-on-surface">Registrar ingreso</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Asigna un producto a una ubicación libre del rack.
      </p>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <UbicacionIngresoForm racks={racks} />
      </div>
    </div>
  );
}
