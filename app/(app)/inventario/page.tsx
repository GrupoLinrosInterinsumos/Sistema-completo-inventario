import Link from "next/link";
import { formatFechaLima } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";

export default async function InventarioPendientesPage() {
  const ingresos = await prisma.ingreso.findMany({
    where: { estado: { in: ["CONFIRMADO", "DESGLOSADO"] } },
    include: { almacen: true, responsable: true, detalles: true },
    orderBy: { fecha: "asc" },
  });

  const pendientes = ingresos
    .filter((ingreso) => ingreso.detalles.some((d) => d.estadoDesglose !== "COMPLETO"))
    .map((ingreso) => {
      const pendientesCount = ingreso.detalles.filter((d) => d.estadoDesglose === "PENDIENTE").length;
      return {
        ingreso,
        estadoLabel: pendientesCount === ingreso.detalles.length ? "Pendiente" : "Parcial",
      };
    });

  return (
    <div className="max-w-5xl">
      <h1 className="text-headline-md text-on-surface">Inventario — ingresos pendientes de desglosar</h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Reparte cada ingreso confirmado en paletas/slots y cajas, y súbelo al stock general.
      </p>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-outline-variant">
          <thead className="bg-surface-container">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Fecha</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Almacén</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">N° Hoja</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Responsable</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Estado</th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase text-on-surface-variant">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {pendientes.map(({ ingreso, estadoLabel }) => (
              <tr className="transition-colors hover:bg-surface-container" key={ingreso.id}>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{formatFechaLima(ingreso.fecha)}</td>
                <td className="px-4 py-2 text-sm text-on-surface">{ingreso.almacen.nombre}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{ingreso.nHoja}</td>
                <td className="px-4 py-2 text-sm text-on-surface-variant">{ingreso.responsable.nombre}</td>
                <td className="px-4 py-2 text-sm">
                  <Badge variant={estadoLabel === "Pendiente" ? "neutral" : "warning"}>{estadoLabel}</Badge>
                </td>
                <td className="px-4 py-2 text-right text-sm">
                  <Link
                    href={`/inventario/${ingreso.id}`}
                    className="font-medium text-on-surface-variant transition-colors hover:text-primary"
                  >
                    Desglosar
                  </Link>
                </td>
              </tr>
            ))}
            {pendientes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                  No hay ingresos pendientes de desglosar.
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
