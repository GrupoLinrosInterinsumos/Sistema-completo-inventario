import { formatFechaLima } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  MOTIVOS_DANO,
  MOTIVO_LABEL,
  MOTIVO_VARIANT,
  cantidadInicial,
  construirWhereRoto,
  parseRotoFiltros,
  ubicacionConPaleta,
} from "@/lib/roto";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { LinkButton } from "@/app/components/ui/link-button";
import { IconDownload, IconPlus } from "@/app/components/ui/icons";
import { DescontarBoton } from "./descontar-boton";

const SELECT_CLASS =
  "mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto";
const LABEL_CLASS = "block text-label-md uppercase tracking-wide text-on-surface-variant";
const TH_CLASS = "px-4 py-2 text-left text-xs font-medium uppercase text-on-surface-variant";

export default async function RotoPage({ searchParams }: PageProps<"/roto">) {
  const params = await searchParams;
  const filtros = parseRotoFiltros(params);

  const registros = await prisma.productoDanado.findMany({
    where: construirWhereRoto(filtros),
    include: { usuario: true, consumos: { include: { usuario: true }, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const exportQuery = new URLSearchParams();
  if (filtros.q) exportQuery.set("q", filtros.q);
  if (filtros.motivo) exportQuery.set("motivo", filtros.motivo);
  exportQuery.set("estado", filtros.estado);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline-md text-on-surface">Roto / NC</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Mercadería rota, no conforme u observada y materiales de almacén. Descuenta lo que se va consumiendo.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/roto/export?${exportQuery.toString()}`}>
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
          <label htmlFor="roto-q" className={LABEL_CLASS}>
            Producto o lote
          </label>
          <input
            id="roto-q"
            type="text"
            name="q"
            defaultValue={filtros.q}
            placeholder="Nombre o lote"
            className="mt-1 w-full rounded-md border border-outline-variant px-2 py-1.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="roto-motivo" className={LABEL_CLASS}>
            Motivo
          </label>
          <select id="roto-motivo" name="motivo" defaultValue={filtros.motivo} className={SELECT_CLASS}>
            <option value="">Todos</option>
            {MOTIVOS_DANO.map((m) => (
              <option key={m} value={m}>
                {MOTIVO_LABEL[m]}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="roto-estado" className={LABEL_CLASS}>
            Estado
          </label>
          <select id="roto-estado" name="estado" defaultValue={filtros.estado} className={SELECT_CLASS}>
            <option value="saldo">Con saldo</option>
            <option value="agotado">Agotados</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        <Button type="submit">Filtrar</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-card border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-outline-variant">
            <thead className="bg-surface-container">
              <tr>
                <th className={TH_CLASS}>Fecha</th>
                <th className={TH_CLASS}>Producto</th>
                <th className={TH_CLASS}>Lote</th>
                <th className={TH_CLASS}>Motivo</th>
                <th className={TH_CLASS}>Disponible</th>
                <th className={TH_CLASS}>Ubicación</th>
                <th className={TH_CLASS}>Usuario</th>
                <th className={`${TH_CLASS} text-right`}>Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {registros.map((r) => {
                const inicial = cantidadInicial(r.cantidad, r.consumos);
                const agotado = r.cantidad <= 0;
                return (
                  <tr key={r.id} className="align-top transition-colors hover:bg-surface-container">
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-on-surface-variant">
                      {formatFechaLima(r.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-sm text-on-surface">
                      {r.nombreProducto}
                      {r.consumos.length > 0 ? (
                        <details className="mt-1 text-xs text-on-surface-variant">
                          <summary className="cursor-pointer font-medium text-primary">
                            Consumos ({r.consumos.length})
                          </summary>
                          <ul className="mt-1 space-y-0.5">
                            {r.consumos.map((c) => (
                              <li key={c.id}>
                                {formatFechaLima(c.createdAt)} — {c.cantidad} {r.unidad} · {c.usuario.nombre}
                                {c.observacion ? ` · ${c.observacion}` : ""}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-on-surface-variant">{r.lote ?? "—"}</td>
                    <td className="px-4 py-2 text-sm">
                      <Badge variant={MOTIVO_VARIANT[r.motivo]}>{MOTIVO_LABEL[r.motivo]}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-on-surface-variant">
                      {agotado ? (
                        <Badge variant="neutral">Agotado</Badge>
                      ) : (
                        <span className="font-semibold text-on-surface">
                          {r.cantidad} {r.unidad}
                        </span>
                      )}
                      {r.consumos.length > 0 ? (
                        <span className="block text-xs">
                          de {inicial} {r.unidad}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-sm text-on-surface-variant">
                      {ubicacionConPaleta(r.ubicacion, r.paleta)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-sm text-on-surface-variant">{r.usuario.nombre}</td>
                    <td className="px-4 py-2 text-right text-sm">
                      {agotado ? null : <DescontarBoton id={r.id} disponible={r.cantidad} unidad={r.unidad} />}
                    </td>
                  </tr>
                );
              })}
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-on-surface-variant">
                    No hay registros que coincidan con el filtro.
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
