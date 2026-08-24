import Link from "next/link";
import { auth } from "@/auth";
import { formatFechaLima } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { sistemaAlmacenActual } from "@/lib/sistema-almacen";
import { Badge } from "@/app/components/ui/badge";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconPlus } from "@/app/components/ui/icons";
import type { Prisma } from "@/app/generated/prisma/client";

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

export default async function IngresosPage() {
  const session = await auth();
  const sistema = session?.user.rol === "ALMACEN" ? await sistemaAlmacenActual() : null;

  const where: Prisma.IngresoWhereInput = sistema ? { almacen: { nombre: sistema } } : {};

  const ingresos = await prisma.ingreso.findMany({
    where,
    orderBy: { fecha: "desc" },
    include: {
      almacen: true,
      responsable: true,
      _count: { select: { detalles: true } },
    },
  });

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Registro de Ingreso</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Fichas de ingreso de mercadería, por fecha y almacén.
          </p>
        </div>

        <LinkButton href="/ingresos/nuevo">
          <IconPlus size={16} />
          Nuevo ingreso
        </LinkButton>
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Fecha</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Almacén</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">N° Hoja</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Responsable</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Productos</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Estado</th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase text-on-surface-variant">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {ingresos.map((ingreso) => (
              <tr className="transition-colors hover:bg-surface-container" key={ingreso.id}>
                <td className="px-4 py-2 text-sm text-on-surface-variant">
                  {formatFechaLima(ingreso.fecha)}
                </td>
                <td className="px-4 py-2 text-sm text-on-surface">{ingreso.almacen.nombre}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{ingreso.nHoja}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{ingreso.responsable.nombre}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{ingreso._count.detalles}</td>
                <td className="px-4 py-2 text-sm">
                  <Badge variant={ESTADO_VARIANT[ingreso.estado]}>{ESTADO_LABEL[ingreso.estado]}</Badge>
                </td>
                <td className="px-4 py-2 text-right text-sm">
                  <Link
                    href={`/ingresos/${ingreso.id}`}
                    className="font-medium text-on-surface-variant transition-colors hover:text-primary"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {ingresos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  Aún no se han registrado ingresos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
