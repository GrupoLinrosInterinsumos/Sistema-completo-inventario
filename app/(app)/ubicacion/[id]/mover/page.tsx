import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MoverForm } from "./mover-form";

export default async function MoverUbicacionPage({
  params,
}: PageProps<"/ubicacion/[id]/mover">) {
  const { id } = await params;

  const item = await prisma.ubicacionStock.findUnique({ where: { id } });
  if (!item) notFound();

  const [racks, ocupadasRaw] = await Promise.all([
    prisma.rack.findMany({ orderBy: { numero: "asc" } }),
    prisma.ubicacionStock.findMany({
      where: { rackId: { not: null } },
      select: { rackId: true, fila: true, columna: true, nombreProducto: true },
    }),
  ]);
  const ocupadas = ocupadasRaw as { rackId: string; fila: string; columna: number; nombreProducto: string }[];

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline-md text-on-surface">Mover ubicación</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {item.nombreProducto} — elige la nueva ubicación.
      </p>

      <div className="mt-6 rounded-card border border-outline-variant bg-surface-container-lowest p-6">
        <MoverForm itemId={item.id} racks={racks} ocupadas={ocupadas} />
      </div>
    </div>
  );
}
