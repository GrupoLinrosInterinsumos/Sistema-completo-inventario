import Link from "next/link";
import { notFound } from "next/navigation";
import { formatFechaLima, formatFechaUTC } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { labelUbicacion } from "@/lib/ubicacion";
import { DesgloseLinea } from "../desglose-linea";

export default async function DesgloseIngresoPage({
  params,
}: PageProps<"/inventario/[ingresoId]">) {
  const { ingresoId } = await params;

  const ingreso = await prisma.ingreso.findUnique({
    where: { id: ingresoId },
    include: {
      almacen: true,
      responsable: true,
      detalles: {
        include: { producto: true, desgloses: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!ingreso) notFound();

  const ubicacionLabel = labelUbicacion(ingreso.almacen.tipoUbicacion);

  return (
    <div className="max-w-5xl">
      <p className="text-label-md uppercase tracking-wide text-on-surface-variant">
        <Link href="/inventario" className="hover:text-primary">
          Desglose
        </Link>{" "}
        &gt; Ingreso #{ingreso.nHoja}
      </p>
      <h1 className="mt-1 text-headline-md text-on-surface">Almacén {ingreso.almacen.nombre}</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Fecha: {formatFechaLima(ingreso.fecha)} · Responsable: {ingreso.responsable.nombre}
      </p>

      {ingreso.estado === "BORRADOR" ? (
        <p className="mt-6 rounded-md bg-amber-100 px-4 py-3 text-sm text-amber-800">
          Este ingreso todavía no ha sido confirmado. Confírmalo desde Registro de Ingreso antes de desglosarlo.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
          {ingreso.detalles.map((detalle) => (
            <DesgloseLinea
              key={detalle.id}
              ingresoDetalleId={detalle.id}
              productoLabel={detalle.producto.nombreSabor}
              lote={detalle.lote}
              fProduccionLabel={formatFechaUTC(detalle.fProduccion)}
              fVencimientoLabel={formatFechaUTC(detalle.fVencimiento)}
              cantidadTotal={detalle.cantidadTotal}
              unidad={detalle.unidad}
              estadoDesglose={detalle.estadoDesglose}
              ubicacionLabel={ubicacionLabel}
              desglosesExistentes={detalle.desgloses}
            />
          ))}
        </div>
      )}
    </div>
  );
}
