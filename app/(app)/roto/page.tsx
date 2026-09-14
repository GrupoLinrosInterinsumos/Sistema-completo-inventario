import { formatFechaLima } from "@/lib/format";
import { condicionesPorPalabra } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconDownload, IconPlus } from "@/app/components/ui/icons";
import type { Prisma } from "@/app/generated/prisma/client";

export default async function RotoPage({
  searchParams,
}: PageProps<"/roto">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const motivo = typeof params.motivo === "string" ? params.motivo : "";

  const where: Prisma.ProductoDanadoWhereInput = {};
  if (q) where.AND = condicionesPorPalabra("nombreProducto", q);
  if (motivo === "ROTO" || motivo === "NC") where.motivo = motivo;

  const registros = await prisma.productoDanado.findMany({
    where,
    include: { usuario: true },
    orderBy: { createdAt: "desc" },
  });

  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (motivo) exportQuery.set("motivo", motivo);
  const exportQueryString = exportQuery.toString();

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Roto / NC</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Registro de mercadería dañada o no conforme, de cualquier almacén.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/roto/export${exportQueryString ? `?${exportQueryString}` : ""}`}>
            <Button variant="outline">
              <IconDownload size={16} />
              Exportar a Excel
            </Button>
          </a>
          <LinkButton href="/roto/nuevo">
            <IconPlus size={16} />
            Registrar
          </LinkButton>
        </div>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-4 rounded-card border border-outline-variant bg-surface-container-lowest p-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="roto-q" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Producto
          </label>
          <input
            id="roto-q"
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Nombre del producto"
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="roto-motivo" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
            Motivo
          </label>
          <select
            id="roto-motivo"
            name="motivo"
            defaultValue={motivo}
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          >
            <option value="">Todos</option>
            <option value="ROTO">Roto</option>
            <option value="NC">NC</option>
          </select>
        </div>
        <Button type="submit">Filtrar</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Producto</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Motivo</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Cantidad</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Ubicación</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {registros.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-surface-container">
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-on-surface-variant">
                    {formatFechaLima(r.createdAt)}
                  </td>
                  <td className="px-4 py-2 text-sm text-on-surface">{r.nombreProducto}</td>
                  <td className="px-4 py-2 text-sm">
                    <Badge variant={r.motivo === "ROTO" ? "danger" : "warning"}>{r.motivo}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-on-surface-variant">
                    {r.cantidad} {r.unidad}
                  </td>
                  <td className="px-4 py-2 text-sm text-on-surface-variant">{r.ubicacion}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-on-surface-variant">{r.usuario.nombre}</td>
                </tr>
              ))}
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    No hay registros de productos rotos/NC.
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
