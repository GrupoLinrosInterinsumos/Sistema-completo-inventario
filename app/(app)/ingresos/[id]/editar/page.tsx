import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IngresoForm } from "../../ingreso-form";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditarIngresoPage({
  params,
}: PageProps<"/ingresos/[id]/editar">) {
  const { id } = await params;
  const session = await auth();

  const [ingreso, almacenes, productos] = await Promise.all([
    prisma.ingreso.findUnique({ where: { id }, include: { detalles: true } }),
    prisma.almacen.findMany({ orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({ where: { activo: true }, orderBy: { nombreSabor: "asc" } }),
  ]);

  if (!ingreso) notFound();

  if (ingreso.estado === "CONFIRMADO" && session?.user.rol !== "SUPERVISOR") {
    redirect(`/ingresos/${id}`);
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-headline-md text-on-surface">Editar registro de ingreso</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {ingreso.estado === "CONFIRMADO"
          ? "Este ingreso ya está confirmado. Los cambios se guardan de inmediato."
          : "Ficha en borrador."}
      </p>

      <div className="mt-6">
        <IngresoForm
          almacenes={almacenes}
          productos={productos}
          mode="editar"
          ingresoId={ingreso.id}
          initial={{
            almacenId: ingreso.almacenId,
            guiaTraslado: ingreso.guiaTraslado ?? "",
            lineas: ingreso.detalles.map((d) => ({
              productoId: d.productoId,
              lote: d.lote,
              fProduccion: toDateInput(d.fProduccion),
              fVencimiento: toDateInput(d.fVencimiento),
              cantidadTotal: d.cantidadTotal,
              unidad: d.unidad,
            })),
          }}
        />
      </div>
    </div>
  );
}
