import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { formatFechaLima, formatFechaUTC } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconDownload } from "@/app/components/ui/icons";
import { confirmarIngresoAction } from "../actions";

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: "Borrador",
  DESGLOSADO: "En desglose",
  CONFIRMADO: "Confirmado",
};

const ESTADO_VARIANT: Record<string, "warning" | "info" | "success"> = {
  BORRADOR: "warning",
  DESGLOSADO: "info",
  CONFIRMADO: "success",
};

export default async function IngresoDetallePage({
  params,
}: PageProps<"/ingresos/[id]">) {
  const { id } = await params;
  const session = await auth();

  const ingreso = await prisma.ingreso.findUnique({
    where: { id },
    include: {
      almacen: true,
      responsable: true,
      detalles: { include: { producto: true } },
    },
  });

  if (!ingreso) notFound();

  const puedeEditar =
    ingreso.estado !== "CONFIRMADO" || session?.user.rol === "SUPERVISOR";

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface">
            Registro de Ingreso — N° {ingreso.nHoja} ({ingreso.almacen.nombre})
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Fecha: {formatFechaLima(ingreso.fecha)} · Responsable: {ingreso.responsable.nombre}
            {ingreso.guiaTraslado ? ` · Guía: ${ingreso.guiaTraslado}` : ""}
          </p>
        </div>

        <Badge variant={ESTADO_VARIANT[ingreso.estado]}>{ESTADO_LABEL[ingreso.estado]}</Badge>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">N°</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Producto</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Lote</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">F.Prod</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">F.Venc</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {ingreso.detalles.map((detalle, index) => (
              <tr className="transition-colors hover:bg-surface-container" key={detalle.id}>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{index + 1}</td>
                <td className="px-4 py-2 text-sm text-on-surface">{detalle.producto.nombreSabor}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{detalle.lote}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {formatFechaUTC(detalle.fProduccion)}
                </td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {formatFechaUTC(detalle.fVencimiento)}
                </td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {detalle.cantidadTotal} {detalle.unidad}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={`/api/ingresos/${ingreso.id}/pdf`}>
          <Button variant="outline">
            <IconDownload size={16} />
            Descargar PDF
          </Button>
        </a>

        {puedeEditar ? (
          <LinkButton href={`/ingresos/${ingreso.id}/editar`} variant="outline">
            Editar
          </LinkButton>
        ) : null}

        {ingreso.estado === "BORRADOR" ? (
          <form action={confirmarIngresoAction.bind(null, ingreso.id)}>
            <Button type="submit">Confirmar ingreso</Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
